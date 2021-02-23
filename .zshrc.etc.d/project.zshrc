alias init-project='now=$(date "+%Y-%m-%d %H:%M:%S");
mkdir configuration diagram document md scripts; 
cd md; 
echo "---\ntitle: Overview\n\ndate: ${now}\n\n---\n">> 0.overview.md;
echo "---\ntitle: Project-manage\n\ndate: ${now}\n\n---\n">> 0.project-manage.md;
echo "---\ntitle: Project-manage-for-me\n\ndate: ${now}\n\n---\n">> 0.project-manage-for-me.md;
echo "---\ntitle: Announcement\n\ndate: ${now}\n\n---\n">> 0.announcement.md;
echo "---\ntitle: Meetings\n\ndate: ${now}\n\n---\n">> 0.meetings.md;
echo "---\ntitle: Resource\n\ndate: ${now}\n\n---\n">> 0.resource.md;
echo "---\ntitle: Background\n\ndate: ${now}\n\n---\n">> 1.background.md;
echo "---\ntitle: Requirement\n\ndate: ${now}\n\n---\n">> 1.requirement.md;
echo "---\ntitle: Design\n\ndate: ${now}\n\n---\n">> 2.design.md;
echo "---\ntitle: Design-for-me-x\n\ndate: ${now}\n\n---\n">> 2.design-for-me-x.md;
echo "---\ntitle: Dev\n\ndate: ${now}\n\n---\n">> 3.dev.md;
echo "---\ntitle: Dev-for-me-x\n\ndate: ${now}\n\n---\n">> 3.dev-for-me-x.md;
echo "---\ntitle: Test\n\ndate: ${now}\n\n---\n">> 4.test.md;
echo "---\ntitle: QA\n\ndate: ${now}\n\n---\n">> 5.qa.md;
echo "---\ntitle: QA-issue-x\n\ndate: ${now}\n\n---\n">> 5.qa-issue-x.md;
echo "---\ntitle: Deploy\n\ndate: ${now}\n\n---\n">> 6.deploy.md;
echo "---\ntitle: Project-review\n\ndate: ${now}\n\n---\n">> 9.project-review.md;
echo "---\ntitle: Inbox\n\ndate: ${now}\n\n---\n">> 9.inbox.md;
cd ..; 
echo -e "*.generated.*\n*.svg\n*.png\n.output\ndocument\nconfiguration/*.key\nfiles\n" >> .gitignore; 
git init; 
git add .; 
git commit -m "init"; '

alias init-project-brief='now=$(date "+%Y-%m-%d %H:%M:%S");
mkdir configuration diagram document md scripts; 
cd md; 
echo "---\ntitle: Overview\n\ndate: ${now}\n\n---\n">> 0.overview.md;
echo "---\ntitle: Project-manage\n\ndate: ${now}\n\n---\n">> 0.project-manage.md;
echo "---\ntitle: Meetings\n\ndate: ${now}\n\n---\n">> 0.meetings.md;
echo "---\ntitle: Background\n\ndate: ${now}\n\n---\n">> 1.background.md;
echo "---\ntitle: Design\n\ndate: ${now}\n\n---\n">> 2.design.md;
echo "---\ntitle: Dev\n\ndate: ${now}\n\n---\n">> 3.dev.md;
echo "---\ntitle: Test\n\ndate: ${now}\n\n---\n">> 4.test.md;
echo "---\ntitle: QA\n\ndate: ${now}\n\n---\n">> 5.qa.md;
echo "---\ntitle: Deploy\n\ndate: ${now}\n\n---\n">> 6.deploy.md;
echo "---\ntitle: Inbox\n\ndate: ${now}\n\n---\n">> 9.inbox.md;
cd ..; 
echo -e "*.generated.*\n*.svg\n*.png\n.output\ndocument\nconfiguration/*.key\nfiles\n" >> .gitignore; 
git init; 
git add .; 
git commit -m "init"; '
