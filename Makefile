yarn:
	yarn

build_applicant: yarn
	yarn build:image:applicant

build_admin: yarn
	yarn build:image:admin

push_applicant:
	docker image rm 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-applicant-web:latest
	docker tag applicant:latest 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-applicant-web:latest
	docker push 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-applicant-web:latest

push_admin:
	docker image rm 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-admin-web:latest
	docker tag admin:latest 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-admin-web:latest
	docker push 801347364784.dkr.ecr.eu-west-2.amazonaws.com/gap-apply-admin-web:latest

run_applicant:
	yarn workspace applicant dev -p 3000

run_admin:
	yarn workspace admin dev -p 3001

create_release_branch:
	git checkout develop
	git pull
	git checkout -b release/1.2.0
