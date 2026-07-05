# Application playbooks

Per-school knowledge files from the user's MBA master research doc, split by
school. `lib/knowledge.ts` matches the target school name against these files
and injects the matching playbook into the research extraction, fit analysis,
story interview, and essay generation prompts.

To add a school: create `<key>.md` here and add the key + name aliases to
`ALIASES` in `lib/knowledge.ts`.

These files are personal research material for the owner's own application
prep. Keep this repository private and do not redistribute their contents.
