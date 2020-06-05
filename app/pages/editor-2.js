import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import dynamic from 'next/dynamic';
import _ from "lodash";

import Side from '../components/Nav/Side';
import Auth from '../src/Auth';

import EditComponent from '../components/Edit/EditComponent';

const GridLayout = dynamic(
  () => import('../components/GridLayout/GridLayout'),
  { ssr: false }
);


const styles = theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  flexColumWidth: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  }
});

@inject('store')
@observer
class EditorTwo extends React.Component {

  async componentDidMount() {
    this.auth = new Auth();
    const {
      auth: { checkTokenAndSetUser },
      project: { limit, page, setProjects }
    } = this.props.store;
    const { query: { pageID } } = this.props.router;
    if (!this.auth.isAuthenticated()) {
      Router.push('/');
    }
    const { token } = this.auth.getSession();
    await checkTokenAndSetUser({ token });
    this.setState({ mounted: true });

    this.init();
  }

  init = async () => {

  }

  onLayoutChange = (a, b) => {
    const { page: { update } } = this.props.store;
    update('layout', a);
    update('layouts', b);
    localStorage.setItem('layouts', JSON.stringify(b));
  }

  render() {
    const { classes } = this.props;

    return (
      <Side
        showSearch={false}
        title={`Editor 2`}
      >
        <div>
          <GridLayout
            onLayoutChange={this.onLayoutChange}
            cols={{ lg: 24, md: 10, sm: 6, xs: 4, xxs: 2 }}
          />
        </div>
        <div>
          <EditComponent />
        </div>
      </Side>
    );
  }
}

EditorTwo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(EditorTwo));
