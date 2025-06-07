import React, { useActionState } from "react";
import { Link, useNavigate } from "react-router";
import "./LoginPage.css";

interface LoginPageProps {
  isRegistering?: boolean;
  setAuthToken: (data:string) => void
}

export function LoginPage({ isRegistering = false, setAuthToken}: LoginPageProps) {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();
  
  // Move useNavigate to the top level of the component
  const navigate = useNavigate();

  async function sendAuthRequest(
    endpoint: string,
    username: string,
    password: string
  ): Promise<string | null> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.status === 201 && isRegistering) {
        console.log("Successfully created account");
        return null;
      } else if (response.status === 200 && !isRegistering) {
        const data = await response.json();
        const token = data.token
        console.log("Token:", token)
        setAuthToken(token);
        // Now use the navigate function that was declared at the top level
        navigate('/');
        // console.log("Token:", data); // Optionally: console.log("Token:", data.token)
        return null;
      } else if (response.status === 409) {
        return "Username already exists";
      } else if (response.status === 400) {
        return "Missing username or password";
      } else if (response.status === 401) {
        return "Incorrect username or password";
      } else {
        return "An unknown error occurred. Please try again.";
      }
    } catch {
      return "Network error. Please try again later.";
    }
  }

  const [result, submit, isPending] = useActionState(async (_prev: any, formData: any) => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const endpoint = isRegistering ? "/auth/register" : "/auth/login";
    return await sendAuthRequest(endpoint, username, password);
  }, null);

  return (
    <div>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form className="LoginPage-form" action={submit}>
        <label htmlFor={usernameInputId}>Username</label>
        <input id={usernameInputId} name="username" required disabled={isPending} />

        <label htmlFor={passwordInputId}>Password</label>
        <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

        <input type="submit" value="Submit" disabled={isPending} />
        {result && (
          <div style={{ color: "red" }} aria-live="polite">
            {result}
          </div>
        )}
      </form>

      {!isRegistering && (
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </div>
  );
}