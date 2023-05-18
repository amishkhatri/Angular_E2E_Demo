Feature: Strategy Module - Strategy Updates

Background: Launching Page/Experience 
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they launch the page or experience from anywhere in the strategy module
  Then they should be able to access it successfully

Scenario: Viewing List of Strategy Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they view the list of strategy updates
  Then they should see the following details for each update:
    - System ID
    - Asset ID and Asset name (linked to the Asset Overview Page IAMPROD-368)
    - Asset criticality
    - Failure Mode ID (linked to the FM overview in IAMPROD-368)
    - Failure Mode Description
    - Strategy-Ticket-ID (unique ID for the requested update)
    - Strategy details: Tasks, intervals, risks (tasks identified in IAMPROD-671 for creating the selected strategy-id)
    - Submitter
    - Approver (fetch the list of approvers from OnePM, where approvers are mapped to assets)
    - Status (Pending, In Review, Approved, Cancelled, Implemented)
    - Date submitted for approval
    - Comments (showing a block of all submitted comments on this update, each prefixed by the Author, role/action, and Time stamp)

Scenario: Sorting and Filtering Strategy Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they sort or filter the strategy updates by date, status, asset, assignee, creator, etc.
  Then the list should be updated accordingly

Scenario: Searching Strategy Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they search for strategy updates using any of the provided fields
  Then the list should be filtered based on the search query

Scenario: Viewing Strategy Details
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they click on a strategy ID to view its details
  Then they should see the tasks in the strategy-ticket-ID by hovering over the strategy ID

Scenario: Reviewing Impact of Pending Strategy Update
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they click on a pending strategy update
  Then they should be able to review the impact, which includes:
    - Strategy summary (fields from IAMPROD-881-1)
    - Impact of change (current and proposed):
      - Annual cost of task(s)
      - Risk impact reduction
      - Total financial impact
    - Proposed change:
      - Current deployed strategy task(s)
      - New task(s)
      - Revised task(s)
    - For each of the above, show:
      - Task(s)
      - Interval
      - Labor hrs/yr
      - Cost/yr
      - Downtime/yr
      - Risk reduction
    - Highlight any changed fields in the "revised tasks" section
    - Audit log for the strategy showing all changes made over time (IAMPROD-881-6)

Scenario: Performing Actions on Pending Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they have permissions to perform tasks on pending updates
  Then they should be able to:
    - Revise the pending update (IAMPROD-883) by launching IAMPROD-671 and editing the view for re-submission
    - Cancel the pending update (IAMPROD-887)
    - Approve the pending update (IAMPROD-884) if they are the approver
    - Re-send the update to the submitter with comments (IAMPROD-888) if they are the approver
    - Apply a "Bulk Action" (IAMPROD-889) based on their permissions

Scenario: Exporting Strategy Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they want to export the list of strategy updates
  Then they should be able to export it to Excel based on the applied filter

Scenario: Count of Pending Strategy Updates
  Given a user with the role of strategy/component approver/owner OR reliability engineer
  When they view the strategy module
  Then they should see the count of pending strategy updates along with the number of affected assets and the strategy risk value being addressed

Scenario: Capturing Submission Details
  Given a user submits a proposed strategy update (IAMPROD-671)
  When they submit the update
  Then IAM should capture:
    - User ID/Name that submitted the update
    - Date/Time of the submission

Scenario: Flagging Strategy Update in OnePM
  Given a strategy update is proposed in Cordant
  When an item task/asset/failure mode is flagged in OnePM
  Then the strategy-update status should be displayed to prevent starting a new strategy update workflow
