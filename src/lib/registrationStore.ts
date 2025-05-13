// Simple store to track registration status

type RegistrationStatus = {
  isRegistered: boolean;
  email: string | null;
  verificationStatus?: "pending" | "verified" | "failed";
  verificationDate?: string;
};

// Initialize from localStorage if available
const getInitialState = (): RegistrationStatus => {
  if (typeof window === "undefined") {
    return { isRegistered: false, email: null };
  }

  const stored = localStorage.getItem("registration_status");
  return stored ? JSON.parse(stored) : { isRegistered: false, email: null };
};

const registrationStore = {
  state: getInitialState(),

  setRegistered(email: string) {
    this.state = {
      isRegistered: true,
      email,
      verificationStatus: "verified",
      verificationDate: new Date().toISOString(),
    };
    localStorage.setItem("registration_status", JSON.stringify(this.state));

    // Dispatch an event so other components can react to the change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("registration_status_changed"));
    }
  },

  setPendingVerification(email: string) {
    this.state = {
      isRegistered: false,
      email,
      verificationStatus: "pending",
    };
    localStorage.setItem("registration_status", JSON.stringify(this.state));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("registration_status_changed"));
    }
  },

  clearRegistration() {
    this.state = { isRegistered: false, email: null };
    localStorage.removeItem("registration_status");

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("registration_status_changed"));
    }
  },

  getStatus(): RegistrationStatus {
    return this.state;
  },

  isRegistered(): boolean {
    return this.state.isRegistered;
  },

  isPendingVerification(): boolean {
    return this.state.verificationStatus === "pending";
  },

  getEmail(): string | null {
    return this.state.email;
  },
};

export default registrationStore;
