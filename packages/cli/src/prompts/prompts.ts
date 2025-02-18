import { createApp, DappType, templateApps } from "../commands/create-app";
import { FrameworkOptions } from "../commands/init";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const inquirer = require("inquirer");

export async function promptForLogin(): Promise<any> {
  const result = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Select your provider:",
      choices: ["Github", "Gitlab", "Bitbucket"],
    },
  ]);
  return result;
}

export async function promptForUploadFile(): Promise<any> {
  const pathSegments = process.cwd().split("/");
  const defaultProject = pathSegments[pathSegments.length - 1];
  const questions = [
    {
      type: "input",
      name: "path",
      message: "Path to file:",
      default: "./",
    },
    {
      type: "list",
      name: "protocol",
      message: "Upload protocol:",
      choices: ["Arweave", "Filecoin", "IPFS"],
    },
    {
      type: "input",
      name: "project",
      message: "Project name:",
      default: defaultProject,
    },
    {
      type: "input",
      name: "organizationId",
      message: "Organization where project will be created (optional):",
    },
  ];
  return inquirer.prompt(questions);
}

export async function promptForCreateOrganization(): Promise<any> {
  const defaultName = `org-${Math.floor(Math.random() * 900) + 100}`;
  const questions = [
    {
      type: "input",
      name: "name",
      message: "Name of the organization:",
      default: defaultName,
    },
    {
      type: "input",
      name: "username",
      message: "Username of the organization:",
      default: defaultName,
    },
  ];
  return inquirer.prompt(questions);
}

export async function promptForInit(): Promise<any> {
  const pathSegments = process.cwd().split("/");
  const defaultProject = pathSegments[pathSegments.length - 1];
  const questions = [
    {
      type: "input",
      name: "project",
      message: "Project name:",
      default: defaultProject,
    },
    {
      type: "list",
      name: "protocol",
      choices: ["Arweave", "Filecoin", "IPFS"],
      message: "Upload protocol:",
    },
    {
      type: "input",
      name: "path",
      message: "Relative path to content:",
      default: "./",
    },
    {
      type: "list",
      name: "framework",
      choices: Object.values(FrameworkOptions).map(
        (option) => option.charAt(0).toUpperCase() + option.slice(1)
      ),
      message: "Framework:",
      default: "static",
    },
  ];
  return inquirer.prompt(questions);
}

export async function promptForCreateApp(appName?: string): Promise<any> {
  inquirer
    .prompt([
      {
        type: "list",
        name: "projectType",
        message: "What type of dapp do you want to create?",
        choices: ["Default dapp", "Start from a template"],
      },
    ])
    .then((answers: any) => {
      if (answers.projectType === "Default dapp") {
        inquirer
          .prompt([
            {
              type: "list",
              name: "template",
              message: "Choose a default dapp type:",
              choices: defaultAppChoices,
            },
            {
              type: "input",
              name: "project",
              message: "Project name:",
              default: function (answers: any) {
                if (appName) {
                  return appName;
                }
                return answers.template.defaultProjectName;
              },
            },
            {
              type: "list",
              name: "protocol",
              message: "Upload protocol:",
              choices: ["Arweave", "Filecoin", "IPFS"],
              default: "Arweave",
            },
          ])
          .then(async (answers: any) => {
            console.log(
              `\nCreating a new ${answers.template.alias} dapp with project name: ${answers.project}. Time to become a wizard 🔮`
            );
            await createApp(
              answers.template,
              answers.project,
              answers.protocol.toLowerCase()
            );
          });
      } else if (answers.projectType === "Start from a template") {
        inquirer
          .prompt([
            {
              type: "list",
              name: "template",
              message: "Choose a template:",
              choices: templateAppChoices,
            },
            {
              type: "input",
              name: "project",
              message: "Project name:",
              default: function (answers: any) {
                return answers.template.defaultProjectName;
              },
            },
            {
              type: "list",
              name: "protocol",
              message: "Upload protocol:",
              choices: ["Arweave", "Filecoin", "IPFS"],
              default: "Arweave",
            },
          ])
          .then(async (answers: any) => {
            if (!answers.project) {
              throw new Error("Project name was not provided");
            }
            console.log(
              `\nCreating a new project from template ${answers.template.alias} with project name ${answers.project}. Time to become a wizard 🔮`
            );
            await createApp(
              answers.template,
              answers.project,
              answers.protocol.toLowerCase()
            );
          });
      }
    });
}

const defaultAppChoices = Array.from(templateApps.values())
  .filter((app) => app.dappType === DappType.Default)
  .map((app) => ({ name: app.alias, value: app }));

const templateAppChoices = Array.from(templateApps.values())
  .filter((app) => app.dappType === DappType.Template)
  .map((app) => ({ name: app.alias, value: app }));
