import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Verify: React.FC = () => {
  const [message, setMessage] = useState(
    "Verifying your email, please wait...",
  );
  const [authEventOccurred, setAuthEventOccurred] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthEventOccurred(true);
        console.log("Auth event in Verify.tsx:", event);
        console.log(
          "Session object in Verify.tsx:",
          session ? JSON.stringify(session, null, 2) : null,
        );

        if (event === "SIGNED_IN" && session && session.user) {
          setMessage(
            "Email verified successfully! Processing your registration...",
          );
          console.log("SIGNED_IN event triggered.");

          console.log(
            "Complete user object from session:",
            JSON.stringify(session.user, null, 2),
          );
          console.log("User ID:", session.user.id);
          console.log("User Email:", session.user.email);

          let userMetaData = session.user.user_metadata;
          if (userMetaData) {
            console.log(
              "User metadata found in session:",
              JSON.stringify(userMetaData, null, 2),
            );
          } else {
            console.warn(
              "User metadata is MISSING or undefined in session.user!",
            );
            userMetaData = {}; // Initialize if null/undefined
          }

          setDebugInfo({
            event,
            user: session.user,
            metadata: userMetaData,
            timestamp: new Date().toISOString(),
          });

          try {
            const user = session.user;
            const user_id = user.id;
            const email = user.email;

            let { first_name, last_name, referral_code } = userMetaData;
            let usingFallback = false;

            // Fallback logic if metadata is missing
            if (!first_name || !last_name || !referral_code) {
              console.warn(
                "CRITICAL: Missing first_name, last_name, or referral_code in user_metadata from session. Attempting fallback from 'contacts' table.",
              );

              const { data: contactData, error: contactFetchError } =
                await supabase
                  .from("contacts")
                  .select("first_name, last_name, referral_code")
                  .eq("email", email)
                  .order("created_at", { ascending: false }) // Get the latest contact entry if multiple
                  .limit(1)
                  .single();

              if (contactFetchError || !contactData) {
                console.error(
                  "Fallback failed: Could not fetch data from 'contacts' table or no matching record found.",
                  contactFetchError,
                );
                setMessage(
                  "Error: Essential user details were not found after verification and could not be recovered. Please contact support or try registering again.",
                );
                return;
              }

              console.log(
                "Fallback successful: Fetched data from 'contacts':",
                contactData,
              );
              first_name = contactData.first_name;
              last_name = contactData.last_name;
              referral_code = contactData.referral_code;
              usingFallback = true;

              // Attempt to update user_metadata if it was missing
              console.log(
                "Attempting to update auth.user with missing metadata via supabase.auth.updateUser...",
              );
              const { data: updatedUserData, error: updateUserError } =
                await supabase.auth.updateUser({
                  data: { first_name, last_name, referral_code },
                });

              if (updateUserError) {
                console.error(
                  "Failed to update user_metadata via supabase.auth.updateUser:",
                  updateUserError,
                );
                // Non-critical for this immediate flow, but good to log. Profile creation will proceed with fallback data.
              } else {
                console.log(
                  "Successfully updated user_metadata via supabase.auth.updateUser:",
                  updatedUserData,
                );
              }
            }

            // Proceed with profile creation using potentially fallback data
            const { error: contactUpdateError } = await supabase
              .from("contacts")
              .update({
                status: "verified",
                verified_at: new Date().toISOString(),
                verification_token: null,
              })
              .eq("email", email);

            if (contactUpdateError) {
              console.error(
                "Error updating contacts table:",
                contactUpdateError,
              );
              throw new Error(
                `Failed to update contact status: ${contactUpdateError.message}`,
              );
            }

            const { error: profileError } = await supabase
              .from("profiles")
              .upsert(
                {
                  user_id,
                  full_name: `${first_name} ${last_name}`,
                  referral_code,
                  is_email_verified: true,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" },
              );

            if (profileError) {
              console.error("Error upserting profile:", profileError);
              throw new Error(
                `Failed to create/update profile: ${profileError.message}`,
              );
            }

            const { error: logError } = await supabase
              .from("audit_logs")
              .insert([
                {
                  user_id,
                  email,
                  action: "email_verified",
                  action_details: {
                    verified_at: new Date().toISOString(),
                    referral_code,
                    metadata_source: usingFallback
                      ? "contacts_fallback"
                      : "session_direct",
                  },
                },
              ]);

            if (logError) {
              console.error("Failed to log email_verified event:", logError);
            }

            setMessage("Registration complete! Redirecting...");
            const redirectUrl = `https://ebank.paynomadcapital.com/signup?access_token=${session.access_token}`;
            window.location.href = redirectUrl;
          } catch (error: any) {
            console.error("Error during post-verification processing:", error);
            setMessage(
              `Error processing your registration: ${error.message}. Please try again or contact support.`,
            );
          }
        } else if (event === "INITIAL_SESSION" && session && session.user) {
          console.log(
            "INITIAL_SESSION event with user detected. User metadata:",
            session.user.user_metadata
              ? JSON.stringify(session.user.user_metadata, null, 2)
              : "MISSING",
          );
        } else if (!session || !session.user) {
          console.warn(
            `Auth event "${event}" received without a valid session or user.`,
          );
        }
      },
    );

    const timer = setTimeout(() => {
      if (!authEventOccurred) {
        console.warn(
          "No specific auth event detected after timeout on Verify.tsx page.",
        );
        setMessage(
          "Could not verify email. The link may be invalid, expired, or there was an issue processing it. Please try requesting a new link from the registration page.",
        );
      }
    }, 7000); // 7 seconds

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="verify-container"
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#2c3e50",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Email Verification
      </h2>
      <p
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {message}
      </p>

      {debugInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          <h3>Debug Information</h3>
          <p>
            <strong>Event:</strong> {debugInfo.event}
          </p>
          <p>
            <strong>User ID:</strong> {debugInfo.user?.id}
          </p>
          <p>
            <strong>Email:</strong> {debugInfo.user?.email}
          </p>
          <p>
            <strong>Timestamp:</strong> {debugInfo.timestamp}
          </p>
          <p>
            <strong>Metadata:</strong>
          </p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(debugInfo.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Verify;
