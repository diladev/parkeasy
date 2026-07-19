# 🅿️ ParkEasy
**Full-stack parking finder & booking platform** - find a spot, book it,pay from a wallet, and the garage that owns it.

![Flutter](https://img.shields.io/badge/Flutter-Clean%20Architecture%20+%20BLoC-44D1FD?logo=flutter&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-EA2845?logo=NestJS&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-41B883?logo=vuedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-00758f?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-1D63ED?logo=docker&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-English%20+%20kurdish%20(RTL)-1d9e75)

## What's inside
| App | Stack | For |
|---|---|---|
| 📱 [`mobile/`](./mobile)| Flutter . Clean Architecture . BLoC . dartz . get_it | Drivers - search, book, extend, wallet|
| ⚙️ [`backend/`](./backend) | JestJS . Sequelize . MySQL . Passport JWT . nestjs-i18n | REST API  + localized errors (en/ckb) |
| 🖥️ [`web/`](./web/) | Vue 3 . Vite . Pinia . Vue Router . Lucide | Garage Portal (teal) + Admin Panel (Purple) |

Designed in Figma first - 35 mobile screens + 10 dashboard screens - with one shared dark design system across all three apps.

## Quickstart - one command

```bash
git clone https://github.com/diladev/parkeasy.git
cd parkeasy
docker compose up -- build
```