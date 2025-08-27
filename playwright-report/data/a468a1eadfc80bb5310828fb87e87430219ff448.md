# Page snapshot

```yaml
- navigation:
  - button "Open menu"
  - link "CFB Fantasy":
    - /url: /
  - link "Scoreboard":
    - /url: /scoreboard
  - link "Standings":
    - /url: /standings
  - link "Mock Draft":
    - /url: /draft/mock
  - link "Create League":
    - /url: /login
  - text: Loading...
- main:
  - heading "Create Account" [level=1]
  - text: First Name
  - textbox "First Name": Test
  - text: Last Name
  - textbox "Last Name": User_7ce940cd
  - text: Email
  - textbox: test_7ce940cd@example.com
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