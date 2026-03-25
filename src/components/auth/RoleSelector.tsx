interface Props {
  role: string;
  setRole: (role: any) => void;
}

const RoleSelector = ({ role, setRole }: Props) => {
  return (
    <div className="flex gap-2 mb-3 justify-between items-center">
      <h1 className="text-lg font-semibold mb-2">Please select your role:</h1>
      <select
        name="role"
        id="role"
        className="p-2 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="receptionist">Receptionist</option>
        <option value="pharmacist">Pharmacist</option>
        <option value="labAssistant">Lab Assistant</option>
        <option value="superadmin">Super Admin</option>
      </select>
    </div>
  );
};

export default RoleSelector;
