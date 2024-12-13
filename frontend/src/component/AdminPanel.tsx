import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchUsers } from '../../api-call/userService';
import { addUsers, removeUser, updateUser } from '../../store/usersSlice';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface User {
  id: string;
  name: string;
  email: string;
  semester: string;
  role: string;
}

export default function AdminPanel() {
  const dispatch = useDispatch();
  const users = useSelector((store: RootState) => store.user.users);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        dispatch(addUsers(fetchedUsers));
        setError(null); // Clear any existing error
      } catch (err) {
        setError('Failed to load users. Please try again later.');
        console.error('Error loading users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Registered Users</h1>

      {loading && <div className="text-center">Loading users...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}

      {!loading && users.length === 0 && !error && (
        <div className="text-center text-gray-500">No registered users found.</div>
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Semester</th>
                <th className="py-3 px-4 text-left">Role</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {users.map((user: User) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: User }) {
  const dispatch = useDispatch();

  const handleEdit = (userId: string) => {
    // Example: Open a form/modal to edit user details
    console.log('Edit user with ID:', userId);
    // Implement the actual editing logic (e.g., show a form)
    const updatedUser = { ...user, name: 'Updated Name' }; // Replace with real form data
    dispatch(updateUser(updatedUser));  // Dispatch the update action
  };

  const handleDelete = (userId: string) => {
    // Dispatch the action to remove the user
    dispatch(removeUser(userId));
  };
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-100">
      <td className="py-3 px-4">{user.name}</td>
      <td className="py-3 px-4">{user.email}</td>
      <td className="py-3 px-4">{user.semester}</td>
      <td className="py-3 px-4">{user.role}</td>
      <td className="py-3 px-4 text-center">
        <button
          onClick={() => handleEdit(user.id)}
          className="text-blue-500 hover:text-blue-700 mr-3"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => handleDelete(user.id)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}

