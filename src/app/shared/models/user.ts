export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  phoneNumber?: string;
}

export interface UserExtended extends User {
  provider?: string;
  uid: string;
  email: string;
  role: 'admin' | 'guest' | 'super-admin';
}
