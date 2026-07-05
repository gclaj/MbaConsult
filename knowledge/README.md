# Application playbooks

Per-school knowledge files from the user's MBA master research doc, split by
school. `lib/knowledge.ts` matches the target school name against these files
and injects the matching playbook into the research extraction, fit analysis,
story interview, and essay generation prompts.

To add a school: create `<key>.md` here and add the key + name aliases to
`ALIASES` in `lib/knowledge.ts`.

`candidate.md` is standing strategic context about the candidate.
`prior-essays/<key>.md` holds the essay sets actually submitted to each school
in the prior cycle — injected for the matching school as the side-by-side
record (reapplications) and as authentic voice samples.

These files are personal research and application material for the owner's own
application prep. Keep this repository private and do not redistribute their
contents.
