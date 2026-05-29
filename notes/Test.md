# Test Plan: Let's Make Sure This Works! 🚀

## 1. Quick Details

| Property | Details |
| :--- | :--- |
| **Test Suite ID** | TS-100 |
| **Environment** | Staging-v2.1.0 |
| **When** | [Insert Date] |
| **Who is running this?** | [Insert Name] |
| **Status** | Draft / Pending Review |

---

## 2. What are we doing here?

### 2.1 The Goal
This is our game plan to make sure things actually work before we ship this release to production. We want to catch any nasty bugs early so we don't get paged in the middle of the night.

### 2.2 What's In, What's Out
* **What we're testing:** 
  * Does the system actually boot up?
  * Can users log in and stay logged in?
  * Are we successfully talking to the database?
  * The main paths in the UI work smoothly.
* **What we're skipping for now:** 
  * Stress and load testing (we'll push limits later).
  * Third-party payment gateway stuff (saving this for Phase 2).

### 2.3 Head Start Assumptions
* You've got full admin access to the staging environment.
* We've already pre-loaded mock data in the staging DB so you don't have to start from scratch.

---

## 3. The Tests

### Test Case 1.1: Does it turn on?
* **The Point:** Make sure all our core services start up cleanly and the main service is actually reachable.
* **Before you start:** Staging should be fully deployed and configured, with all the necessary network ports open.

**Steps to run it:**
1. Pop open your terminal and start up the main service:
   ```bash
   systemctl start main-service
   ```
2. Keep an eye on the logs in real-time to spot any weird errors:
   ```bash
   tail -f /var/log/system.log
   ```
3. Check that all our microservices are reporting a "Healthy" status.
4. Throw `https://staging.testsystem.internal/health` into your browser to check the health endpoint.

**What should happen:**
* **Expected:** The system starts up smoothly, dependencies are happy, and the health check endpoint returns a nice JSON payload showing `"status": "Healthy"` with an HTTP 200 OK.
* **Actual:** (Leave blank for now)

---

### Test Case 1.2: Can users actually log in?
* **The Point:** Make sure valid users can jump right in, and bad logins get turned away nicely.
* **Before you start:** Make sure the test DB has our go-to account ready (`testuser@domain.com` / `ValidPass123!`).

**Steps to run it:**
1. Go to the login page.
2. Put in the real credentials and hit "Login". You should land straight on the dashboard.
3. Log out.
4. Try a bad password and see how the UI handles it.
5. Try logging in without entering a username.

**What should happen:**
* **Expected:**
  * **Good login:** Drops you on the dashboard with a valid session token.
  * **Bad password:** Shows a friendly "Incorrect username or password" error.
  * **Blank field:** Triggers a quick UI warning and stops the form from even submitting.
* **Actual:** (Leave blank for now)

---

## 4. Found a bug? Here's how to flag it
If something breaks, go ahead and log a ticket. Use this quick guide to decide how urgent it is:

| Severity | How bad is it? | Examples |
| :--- | :--- | :--- |
| **Blocker** | Showstopper. App crashed, data got wiped, or we can't test anything else. | Core DB connection is completely dead |
| **Critical** | Major feature is broken with zero workarounds. | Nobody can log in at all |
| **Major** | Something is broken, but we can work around it manually. | Filter dropdown is broken, but searching still works |
| **Minor** | Visual polish, typos, or minor alignment tweaks. | A button is off by 2 pixels, or there's a typo in the footer |

---
*Quickly put together from our drafts to make sure we're ready to roll!*