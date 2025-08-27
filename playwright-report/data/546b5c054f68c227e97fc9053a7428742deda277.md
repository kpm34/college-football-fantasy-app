# Page snapshot

```yaml
- navigation:
  - button "Open menu"
  - link "CFB Fantasy":
    - /url: /
- main:
  - heading "Create Account" [level=1]
  - text: First Name
  - textbox "First Name": Test
  - text: Last Name
  - textbox "Last Name": User_95c7f906
  - text: Email
  - textbox: test_95c7f906@example.com
  - text: Password
  - textbox: TestPass123!
  - button "Creating..." [disabled]
  - paragraph:
    - text: Already have an account?
    - link "Login":
      - /url: /login
- status:
  - img
  - text: Static route
  - button "Hide static indicator":
    - img
- alert
```