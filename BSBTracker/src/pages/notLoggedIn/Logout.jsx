export default function Logout() {
  const handleLogout = () => {
    // Remove token and user from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully!");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
