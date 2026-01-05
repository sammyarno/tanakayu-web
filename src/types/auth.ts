export interface JwtUserData {
  id: string;
  username: string;
  role: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
}
