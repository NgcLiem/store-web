export class CreateStaffDto {
  email!: string;
  password!: string;
  fullName!: string;
  phone?: string;
  status?: string;
}
