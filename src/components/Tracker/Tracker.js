import React from "react";
import ReactDOM from "react-dom";
import {Redirect} from 'react-router';

import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider, Query } from 'react-apollo';
import { setContext } from 'apollo-link-context';
import gql from "graphql-tag";

// import {FormField , Button} from 'grommet';
import Status from 'grommet/components/icons/Status';
import Spinning from 'grommet/components/icons/Spinning';
import InspectIcon from 'grommet/components/icons/base/Inspect'
import UserManagerIcon from 'grommet/components/icons/base/UserManager'


import FormField from 'grommet/components/FormField';
import Button from 'grommet/components/Button';
import TextInput from 'grommet/components/TextInput';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Notification from 'grommet/components/Notification';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';
import Layer from 'grommet/components/Layer';
import Heading from 'grommet/components/Heading';
import Title from 'grommet/components/Title';
import Label from 'grommet/components/Label';
import Animate from 'grommet/components/Animate';
import Paragraph from 'grommet/components/Paragraph';

import NavigationBar from '../NavigationBar/NavigationBar';
import Utils from '../../utils/Utils';
// import ApolloClient from "apollo-boost
// import { ApolloClient } from 'apollo-client';

const IssuesList = (data) => {
  console.log('%c %o IssuesList Component','color:rgb(175, 41, 106)',data.data)
  let listIssues = data.data.map( (issue, i) => {
    return (
      <Animate
        key={issue.node.id}
        enter={{"animation": "slide-down", "duration": 1000, "delay": 0.2}}
        leave={{"animation": "slide-up", "duration": 1000, "delay": 0.2}}
        keep={true}>
          <ListItem  data-url={issue.node.url} onClick={() => {window.location.assign(issue.node.url)}}>
            <Box basis='3/4' style={issue.node.closed ? {color:'#d41010'}:null} >{issue.node.title}</Box>
            <Box basis='1/4' direction='row' alignContent='center' align='center'> <UserManagerIcon size='small'/>{issue.node.author.login}</Box>
          </ListItem>
    </Animate>
    )
  })
  return (
    <div>
      <Title margin='medium'>Lista de issues</Title>
      <Label style={{color:'#d41010'}}>Cerrado</Label>
      <List>
          {listIssues}
      </List>
    </div>
  )
}

/**
* This component handles the render of the results
* It handles the state of the form to show the status of the query
* @param repoOwner it is the Value that the user sets in the repoOwner TextInput
* @param repoName it is the Value that the user sets in the repoName TextInput
* @param validForm it is the boolean value that handles the Form status to Send the query
* @param callback it can handle som callback to update the state or other paramters in the main componennt HOome
**/
const Results = ({issuesList, repoOwner, repoName, validForm, callbackData, query}) => {
  // console.log('Rendering REsults')
  let conditionalComponent = null;
  let listIssues = null;
  if( !validForm  ){
    conditionalComponent = (
      null
    )
  }
  else if(issuesList != null){
    conditionalComponent = (
      <IssuesList data={issuesList.repository.issues.edges}/>
    )
  }
  else {
    conditionalComponent = (
      <Query query={query}
             variables={{repoOwner, repoName }}>
      {({loading, error, data}) => {
        // console.log('%c %s Loading','color:rgb(55, 23, 209);font-size:1.2em;', loading);
        // console.log('%c %s Error','color:rgb(181, 33, 33);font-size:1.2em;' ,error);
        // console.log('%c %o Data','color:rgb(25, 177, 113);font-size:1.2em;' ,data);
        if(loading) return  <Spinning />
        if(error ){
          console.log(error);
          return  (
            <Notification
              message={'Error'}
              size={'small'}
              status={'critical'}
            />
          )
        }
        if(data.repository.issues.edges.length < 1){
          return <div>No hay issues en este repositorio </div>
        }
        callbackData(data);
        return <IssuesList data={data.repository.issues.edges}/>
    }}
     </Query>
    )
  }
  return (
      conditionalComponent
  )
}

class Tracker extends React.Component {
constructor(props){
  super(props);
  this.state = {
    repositoryOwner         : '',
    repositoryName          : '',
    requestReady            : false,
    client                  : null,
    submitting              : false,
    issuesList              : null,
    validForm               : false,
    tokenCode               : null,
    mounted                 : false,
    logged                  : false,
    userData                : null,
    authLink                : null,
  }

  /**
  * This function handles the authorization HEaders to handle github Data with GraphQL
  * it uses the setContext function and the Personal Token
  **/
this.updateAuthLink = (gitHubPersonalToken) => {
    const aLink = setContext((_,{ headers }) => {
      return{
        headers:{
          ...headers,
          Authorization:`Bearer ${gitHubPersonalToken}`,
        }
      }
    });
    const client_ = new ApolloClient({
      link:aLink.concat(new HttpLink({uri:"https://api.github.com/graphql"})),
      cache: new InMemoryCache(),
    });

      this.setState({
        authLink: aLink,
        client : client_,
      })
};
  /**
  * This is to store the query, it can use variables to make it more flexible
  * in this case the query just has
    @param $repoOwner
    @param $repoName
  **/
  this.GET_REPOSITORY_ISSUES = gql`
  query repository($repoOwner:String!, $repoName:String!){
    repository(owner:$repoOwner,name:$repoName){
      issues(last:20,){
        edges{
          node{
            title
            url
            id
            closed
            state
            author{
              login
            }
            labels(first:5){
              edges{
                node{
                  name
                }
              }
            }
          }
        }
      }
      }
  }`;

  this.getIssues = () => {
    console.log('send apollo client');
    console.log(this.GET_REPOSITORY_ISSUES);
    const {data } = this.state.client.query(
      {
        query             : this.GET_REPOSITORY_ISSUES,
        variables:{
          repoOwner       :this.state.repositoryOwner,
          repoName        : this.state.repositoryName
        } })
        .then(data => console.log({ data }));
  }
  this.handleRepoName = (e) => {
    this.setState({
      repositoryName       : e.target.value,
      validForm            : false,
    },()=>{this.isReadyToQuery();})
  }
  this.handleRepoOwner = (e) => {
    this.setState({
      validForm            : false,
      repositoryOwner      : e.target.value,
    },()=>{this.isReadyToQuery();})
  }
  this.handleRequestClick = () => {
    this.setState({
      issuesList           : null,
      requestReady         : true,
    },()=>{this.isReadyToQuery();})
  }
  this.isReadyToQuery = () =>{
    if(this.state.repositoryName != '' && this.state.repositoryOwner != '' && this.state.requestReady){
      this.setState({
        validForm          : true,
      })
    }
  }
  this.callbackData = ( data ) => {
    console.log('Callback Data', data);
    this.setState({
      issuesList          : data,
    })
  }
}

componentDidMount(){
  const userD = Utils.getUserData();
  const userToken = Utils.getToken();
  if(userD != null && userToken != null){
    this.updateAuthLink(userToken);
    this.setState({
      logged              : true,
      userData            : userD,
      mounted             : true,
    }, )
  }
  else {
    this.setState({
      redirectLogin       : true,
    })
  }
}

  render() {
    if(this.state.redirectLogin){
      return (<Redirect push exact to={{pathname:'/ingresar'}}/>)
    }
    else if(this.state.mounted){
      return (
        <ApolloProvider client={this.state.client}>
          <Box
              flex={true}
              basis='full'
              align='center'
              justify='center'
              margin='large'
              pad='medium'
              colorIndex='light-1'
              >
              <NavigationBar/>
              <Heading margin={'medium'}>Bienvenido {this.state.userData.name}</Heading>
              <Title margin={'medium'}>Ingresa el nombre de usuario y el repositorio que quieras explorar.</Title>
              <Box
                basis='1/2'
                direction='row'
                >
                <Box>
                  <Label size='small' labelFor='repositoryOwner'>
                    Nombre de Usuario/ Dueño
                  </Label>
                  <TextInput
                    id='repoOwner'
                    name='repositoryOwner'
                    placeholder='Owner'
                    suggestions={['facebook','grommet','wjjh','parcel-bundler']}
                    value={this.state.repositoryOwner}
                    onDOMChange={this.handleRepoOwner}/>
                </Box>
                <Box>
                  <Label size='small' labelFor='repositoryName'>
                    Nombre de repositorio
                  </Label>
                  <TextInput
                    id='repoName'
                    name='repositoryName'
                    placeholder='Name'
                    value={this.state.repositoryName}
                    onDOMChange={this.handleRepoName}/>
                </Box>
                </Box>
                <Box
                  basis='full'
                  margin='large'
                  flex={true}
                  full='true'
                  >
                  <Button
                    accent
                    icon={<InspectIcon/>}
                    label="Muéstrame los issues"
                    hoverIndicator='background'
                    onClick={() => {this.handleRequestClick();}}>
                  </Button>
               </Box>
            <Results
              issuesList={this.state.issuesList}
              repoOwner={this.state.repositoryOwner}
              repoName={this.state.repositoryName}
              validForm={this.state.validForm}
              callbackData={this.callbackData}
              query={this.GET_REPOSITORY_ISSUES}/>
          </Box>
        </ApolloProvider>
      );
    }
    else {
      return(
        <Box
          basis='full'
          justify='center'
          align='center'
          alignContent='center'
          full={true}>
          <Spinning size='large'/>
          <Paragraph size='small'>Espera por favor...</Paragraph>
        </Box>
      )
    }

  }
}

export default Tracker;
