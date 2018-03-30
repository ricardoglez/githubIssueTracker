import React from 'react';
import ReactDOM from "react-dom";
import {Redirect} from 'react-router-dom';

import Status from 'grommet/components/icons/Status';
import Spinning from 'grommet/components/icons/Spinning';
import SocialGithubIcon from 'grommet/components/icons/base/SocialGithub'

import Heading from 'grommet/components/Heading';
import Anchor from 'grommet/components/Anchor';
import LoginForm from 'grommet/components/LoginForm';
import Button from 'grommet/components/Button';
import Notification from 'grommet/components/Notification';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';
import Layer from 'grommet/components/Layer';
import Title from 'grommet/components/Title';
import Animate from 'grommet/components/Animate';


import NavigationBar from '../NavigationBar/NavigationBar';
import Utils from '../../utils/Utils';

const provider = new firebase.auth.GithubAuthProvider();
class Login extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      userData              : null,
      submitting            : false,
      redirectTracker       : false,
      accessToken           : null,
    }
    this.submitLogin = ( e ) => {
      console.log( e );
      this.setState({
        submitting          :true,
      }, () => {
        firebase.auth()
        .signInWithPopup(provider)
          .then((result) => {
            console.log('%c Login result','color:rgb(73, 167, 64);font-size:1.2em;');
            console.log(result);
            const token             = result.credential.accessToken;
            const user              = {name: result.user.displayName, refreshToken: result.user.refreshToken,};

            Utils.setToken(token);
            Utils.setUserData(user);
            this.setState({
              accessToken           : token,
              userData              : user,
            }, () => {
              console.log('After Data Received');
              this.setState({
                redirectTracker       : true,
                submitting            : false,
              })
              // console.log(this.state);
              // console.log(token, user);
            });
        }).catch(function(error) {
            const errorCode           = error.code;
            const errorMessage        = error.message;
            const email               = error.email;
            const credential          = error.credential;
        });
      })
    }
  }

  render(){
    let conditionalComponent = null;
    if(this.state.redirectTracker || this.state.accessToken){
      conditionalComponent = (
        <Redirect
           push
           to ='/tracker'
        />
      )
    }
    else{
      conditionalComponent = (
        <Box
           direction='column'>
            <Box
               direction='row'
               justify='center'
               align='center'
               pad='medium'
               margin='large'
               colorIndex='light-1'>
               <NavigationBar/>
            </Box>
            <Animate
              enter={{"animation": "fade", "duration": 1000, "delay": 0}}
              keep={true}
              >
                <Box
                   direction='column'
                   justify='center'
                   align='center'
                   pad='medium'
                   margin='large'
                   colorIndex='light-1'>
                   <Heading strong={true}>
                     GitHub issues tracker
                  </Heading>
                  <Title
                    margin='medium'>
                    Con esta aplicación podrás agregar issues a tus repositorios favoritos.
                  </Title>
                  <Box
                    direction='row'
                    justify='center'
                    align='center'
                    margin='large'
                    colorIndex='light-1'
                    >
                    <Button
                      disabled={this.state.submitting}
                      icon={this.state.submitting ? <Spinning/>:<SocialGithubIcon/>}
                      label='Ingresa con GitHub'
                      onClick={this.submitLogin}
                      primary
                    />
                  </Box>
                </Box>
            </Animate>
    </Box>
      )
    }
    return conditionalComponent;
  }
}

export default Login;
