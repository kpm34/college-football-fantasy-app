# Page snapshot

```yaml
- navigation:
  - button "Open menu"
  - link "CFB Fantasy":
    - /url: /
- main:
  - heading "Welcome Back" [level=1]
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Login"
  - text: Or continue with
  - button "Continue with Google":
    - img
    - text: Continue with Google
  - button "Continue with Apple":
    - img
    - text: Continue with Apple
  - paragraph:
    - text: Don't have an account?
    - link "Sign up":
      - /url: /signup
  - paragraph: "Endpoint: https://nyc.cloud.appwrite.io/v1"
  - paragraph: "Project: college-football-fantasy-app"
  - paragraph: "Domain: localhost"
- status:
  - img
  - text: Static route
  - button "Hide static indicator":
    - img
- alert
```