import React from 'react'
import { Button, Typography } from '@material-ui/core';

import { action, observable, computed, toJS } from 'mobx';
import { tokenCheck } from '../src/apiCalls/user';
import { maybeSetToken } from '../src/apiCalls/api';

const _userObject = {
  email: '',
  firstName: '',
  lastName: '',
  team: '',
  permissions: { permissions: {}, groups: [] },
  name: "",
  wantToBuild: "",
  intros: { welcome: false },
  hasHadTutorial: false,
};

const projectSteps = [
  {
    selector: '#first-project',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {"This is where your projects live. You can have one or many different projects each with unique capabilities."}
        </Typography>
      </div>
    )
  },
  {
    selector: '#first-project-edit',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {"Click here to edit your project's name."}
        </Typography>
      </div>
    )
  },
  {
    selector: '#create-new-project',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {'Click this button to create a new project. You\'ll have to upgrade to create more than one project.'}
        </Typography>
      </div>
    )
  },
  {
    selector: '#help-button',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {'Click here to see this tutorial again. It will be on every page.'}
        </Typography>
      </div>
    )
  },
  {
    selector: '#first-project-select',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {'To get started building your app, click "select".'}
        </Typography>
      </div>
    )
  },

];
const helpSteps = [
  {
    selector: '#help-tutorials',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {"Here are a few tutorials. We highly recommend you take a look at one of them before you get started!"}
        </Typography>
      </div>
    )
  },
  {
    selector: '#help-feedback',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {"If you have any questions, you can come back here and shoot us a message."}
        </Typography>
      </div>
    )
  },
  {
    selector: '#help-clone',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {"Now, let's get started. Do yourself a favor and clone a project to get started. Even if you later delete it, it will help you learn how to build effectively in Dropp."}
        </Typography>
      </div>
    )
  },
];
const templateSteps = [
  {
    selector: '#template-container',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {`
            Each of these templates is a different kind of project.
            Take a look at the demos to see what's closest to what you want to build.
            If you can't find one, just pick one to learn.
          `}
        </Typography>
      </div>
    )
  }, {
    selector: '#template-demo',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {`
            Click on this button to view the demo. Don't be shy!
          `}
        </Typography>
      </div>
    )
  }, {
    selector: '#template-clone',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {`
            Go ahead and clone this project, even if you later delete it.
            It'll be much easier for you to get started.
          `}
        </Typography>
      </div>
    )
  }];
const dataSteps = [
  {
    selector: '#data-model',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Click on the data model to view the data for this model.
          `}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`
            These are your data models.
            Each project needs to have a data model.
            This is where the data for your application lives.
            Think of this like a fancy excel spreadsheet.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#data-field',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {`
            These are your data fields.
            This holds the data for just one data model.
          `}
        </Typography>
        <Typography variant="body1">
          {`
            Some of them you can delete, other's you can't.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#data-field-form',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1">
          {`
            Here's where you add a data field to your model. For example if you wanted to add a
            gender to the user model, you could do so here.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#data-table',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            This is a table for you to add test data
            to work with while building your app.
          `}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`
            To add an item, click on the "+" button on the right hand side to add it to the table.
            When you start designing your app, you'll be able to use this
            data.
          `}
        </Typography>
      </div>
    )
  },
];

const pageStyleWidth = { width: 600 };

const pageSteps = [
  {
    selector: '#pages-edit',
    content: (
      <div className="page-style-width">
        <iframe
          title={"pages-tutorial-1"}
          width="550"
          height="315"
          src="https://www.youtube.com/embed/YQ90tLDt64E"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Typography variant="body1" gutterBottom>
          {`
            This is where you edit components. After you drag and drop an element. Click on it to see the available options to edit.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#pages-elements',
    content: (
      <div className="page-style-width">
        <iframe
          title={"pages-tutorial-2"}
          width="550"
          height="315"
          src="https://www.youtube.com/embed/CM-7Fnbzd8g"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Typography variant="body1" gutterBottom>
          {`
            This holds all the elements you can drag and drop onto the page
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#pages-tree',
    content: (
      <div className="page-style-width">
        <iframe
          title={"pages-tutorial-3"}
          width="550"
          height="315"
          src="https://www.youtube.com/embed/Oug7A5JvQHk"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Typography variant="body1" gutterBottom>
          {`
            This is a different view for all the components in your application.
          `}
        </Typography>
      </div>
    )
  },
]

const deploySteps = [
  {
    selector: '#deploy-checklist',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            This is a little list letting you know what you
            need to complete before deploying your app.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#deploy-list',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Your past 5 deployments show up here.
            You'll be able to see their deployment status in real time.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#deploy-new',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            When you're ready to deploy, you can name your deployment and
            click "Create".
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#deploy-url',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            When your app get's deployed, it will get a unique URL. To change the URL to a custom domain,
            upgrade to a paid plan.
          `}
        </Typography>
      </div>
    )
  },
];

const settingsSteps = [
  {
    selector: '#settings-top',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Try setting up your media storage to upload
            your logo, background image, and favicon URL to quickly
            get started.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#settings-api-key',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            This is your project's API Key. You can use this to integrate with Zapier and all kinds of other applications.
          `}
        </Typography>
        <Button variant="contained" color="primary" size="small" onClick={() => window.open('https://blog.noco.io/noco-zapier', '_blank')}> View Integration Tutorial </Button>
      </div>
    )
  },
];

const userPermissionSteps = [
  {
    selector: '#userPerms-top',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            User permissions gives you fine grained control over your application.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#userPerms-names',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            You can name your user permission role. Whenever a user has this permission name as their "role" they will only be allowed to perform these actions.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#userPerms-admin',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            You must have one default admin user role and one default regular user role.
            The first user to log in to your app will get the role of the admin,
            and the following users will get the default user role.
          `}
        </Typography>
      </div>
    )
  }
];

const mediaSteps = [
  {
    selector: '#media-top',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Set up your storage for your app. You get your own
            S3 bucket and can use this to upload assets for your app
            like a logo or background images.
          `}
        </Typography>
      </div>
    )
  }
];

const themeSteps = [
  {
    selector: '#theme-top',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Customize your app colors! Select between dark and light mode
            and choose a custom font as well as colors.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#theme-preview',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Change the values on the left and preview your changes here!
          `}
        </Typography>
      </div>
    )
  }
];

const navSteps = [
  {
    selector: '#nav-top',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Don't get thrown off. This page simulates what your users will see. You can configure your navigation settings on this page.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#nav-hamburger',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Play with the settings to adjust how you want your navigation. It will work similar to
            how our nav works in the Dropp app.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#nav-back',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Click here to go back.
          `}
        </Typography>
      </div>
    )
  }
];

const componentSteps = [
  {
    selector: '#components-first',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom>
          {`
            Components are the core part of your app.
            You should really watch a tutorial before diving in here.
          `}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.open("https://www.youtube.com/channel/UCKcQrJg-N_-SoXZvWw69OyA/playlists", '_blank')}> Watch Tutorial </Button>
      </div>
    )
  },
  {
    selector: '#components-type',
    content: (
      <div className="__giveSpace">
        <Typography variant="body1" gutterBottom className="white-space-pre">
          {`There are 3 types of components:
- basic
- form
- and repeatable`}
        </Typography>
      </div>
    )
  },
  {
    selector: '#components-type',
    content: (
      <div className="__giveSpace">
        <Typography variant="h6" gutterBottom>
          Basic Components
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`
            Basic components are re-usable elements for your app.

            Think of using this for a footer at the bottom of every page of your app.
          `}
        </Typography>
      </div>
    )
  },
  {
    selector: '#components-type',
    content: (
      <div className="__giveSpace">
        <Typography variant="h6" gutterBottom>
          Form Components
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`
            Form components allow you to bind form data to your data model so when a user submits
            your app knows where to put data from each of the fields.
          `}
        </Typography>
        <img src="https://s3.us-west-1.wasabisys.com/noco/landing/form.png" className="__max_width"/>
      </div>
    )
  },
  {
    selector: '#components-type',
    content: (
      <div className="__giveSpace">
        <Typography variant="h6" gutterBottom>
          Repeatable Components
        </Typography>
        <Typography variant="body1" gutterBottom>
          {`
            Repeatable components allow you to iterate over multiple items with a consistent interface.
            Please clone a project to see how this works before trying it on your own.
          `}
        </Typography>
        <img src="https://s3.us-west-1.wasabisys.com/noco/landing/repeatable.png" className="__max_width"/>
      </div>
    )
  }
]
class AuthStore {

  @observable user = _userObject;
  @observable orderHistory = [];
  @observable allSpecialty = [];
  @observable customer = {};
  @observable backgrounds = [];
  @observable welcomeDialog = false;
  @observable learnType = '';

  // tours
  @observable tourOpen = false;
  @observable steps = [];
  @observable tourName = "";
  @observable projectSteps = projectSteps;
  @observable helpSteps = helpSteps;
  @observable templateSteps = templateSteps;
  @observable dataSteps = dataSteps;
  pageSteps = pageSteps;
  deploySteps = deploySteps;
  settingsSteps = settingsSteps;
  userPermissionSteps = userPermissionSteps;
  mediaSteps = mediaSteps;
  themeSteps = themeSteps;
  navSteps = navSteps;
  componentSteps = componentSteps;

  @action.bound update = (k, v) => this[k] = v;
  @action.bound updateAuth = (k, v) => this[k] = v;

  @action.bound async setLocalUser(user) {
    this.user = user;
    localStorage.setItem('@NOCO-user', JSON.stringify(user));
  }

  @action.bound async checkTokenAndSetUser({ token }) {
    const res = await tokenCheck(token);
    if (res && res.user) {
      const { email, first_name, last_name, id, teams, name, wantToBuild, role, walkthroughs, phone, intros, hasHadTutorial } = res.user;
      this.user.email = email;
      if (first_name) this.user.first_name = first_name;
      if (name) this.user.name = name;
      if (last_name) this.user.last_name = last_name;
      this.user.id = id;
      this.user.walkthoughs = walkthroughs;
      this.user.teams = teams;
      this.user.role = role;
      this.user.phone = phone;
      if (hasHadTutorial) this.user.hasHadTutorial = hasHadTutorial;
      if (intros) this.user.intros = intros;
      if (wantToBuild) this.user.wantToBuild = wantToBuild;
      this.userPermissions = res.user.permissions;
      localStorage.setItem('@NOCO-user', JSON.stringify(res.user));
      maybeSetToken(token);
    }
  }
}

export default AuthStore;
