// Simple test script to test organizer registration
const testData = {
  name: "Test Organizer",
  email: "test" + Date.now() + "@example.com", // Unique email
  password: "password123",
  orgName: "Test Organization",
  legalName: "Test Legal Name",
  phone: "08123456789",
  npwp: "123456789"
};

console.log("Testing organizer registration with data:", testData);

fetch("http://localhost:3001/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
.then(response => response.json())
.then(data => {
  console.log("Response:", data);
})
.catch(error => {
  console.error("Error:", error);
});
