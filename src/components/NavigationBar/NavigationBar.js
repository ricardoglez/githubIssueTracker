import React from 'react';
import Utils from '../../utils/Utils';
import {Redirect} from 'react-router-dom';

import Button from 'grommet/components/Button';
import Box from 'grommet/components/Box';

import LogoutIcon from 'grommet/components/icons/base/Logout'
import SocialGithubIcon from 'grommet/components/icons/base/SocialGithub'
import Spinning from 'grommet/components/icons/Spinning'

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token             :null,
      userData          :null,
      redirectLogin     :false,
    };
    this.logout = () => {
      Utils.logout();
      this.setState({
        redirectLogin    : true,
      }, () =>{
        window.location.assign('/ingresar');
      })
    }
  }

  componentDidMount() {
      this.setState({
        token             : Utils.getToken(),
        userData          : Utils.getUserData(),
      })
  }

  render() {
    if(this.state.redirectLogin){
     return (<Redirect push to={{path:'ingresar'}}/>)
   }
   else if(this.state.token != null){
      return (
        <Box
          align='center'
          basis='full'
          justify='around'
          direction='row'
          flex={true}
          full={'horizontal'}
          >
            <Box
              basis='3/4'
              justify='around'
              >
              <SocialGithubIcon size='medium'/>
            </Box>
            <Box
              justify='end'
              flex={true}
              basis='1/4'
              >
              <Button
                size='small'
                icon={!this.state.submitting ? <LogoutIcon/>: <Spinning/>}
                label={'Cerrar sesión'}
                onClick={this.logout}
                critical
              />
            </Box>
      </Box>
      );
    }
    else {
      return <SocialGithubIcon size={'xlarge'}/>
    }
  }
}

export default NavigationBar;
