export interface UserData {
  role: string
  profile_image: string
  username: string
  uid: string
}

export interface AdminUserData {
  role: string
  profile_image: string
  username: string
  uid: string
  promotion_request: string | null
}
