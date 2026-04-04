```
User
├── name: String
├── email: String (unique)
├── password: String (hashed)
├── role: enum [admin, creator, learner]
└── status: enum [active, blocked, suspended]

User_data
├── user_id → User
├── avatar: String
├── bio: String
└── ...whatever huge data later

Content
├── owner_id → User
├── collaborators: [User]
├── title: String
├── tiptap_json: String
├── access_type: enum [public, link-only, private]
├── created_at: Date
└── updated_at: Date

User_content  (progress/answers tracker)
├── user_id → User
├── content_id → Content
├── answers: Map<component_id, any>
└── last_visited: Date
```
