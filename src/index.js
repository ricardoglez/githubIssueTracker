import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider, Query } from 'react-apollo';
import { setContext } from 'apollo-link-context';
import gql from "graphql-tag";


// import {FormField , Button} from 'grommet';
import Status from 'grommet/components/icons/Status';
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
import Spinning from 'grommet/components/icons/Spinning';



// import ApolloClient from "apollo-boost
// import { ApolloClient } from 'apollo-client';


const graphUrl = new HttpLink({uri:"https://api.github.com/graphql"});

const gitHubPersonalToken = '6393d6e949abfd5e22f1c35b195de0c0b3acd0c3';

/**
* This function handles the authorization HEaders to handle github Data with GraphQL
* it uses the setContext function and the Personal Token
**/
const authLink = setContext((_,{ headers }) => {
  return{
    headers:{
      ...headers,
      authorization:`Bearer ${gitHubPersonalToken}`,
    }
  }
})

/**
* The client object contains the link with the headers
* and the Memory cache to show results faster
**/
const client = new ApolloClient({
  link:authLink.concat(graphUrl),
  cache: new InMemoryCache(),
});

/**
* This is to store the query, it can use variables to make it more flexible
* in this case the query just has
  @param $repoOwner
  @param $repoName
**/
const GET_REPOSITORY_ISSUES = gql`
query repository($repoOwner:String!, $repoName:String!){
  repository(owner:$repoOwner,name:$repoName){
    issues(last:20,){
      edges{
        node{
          title
          url
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

const IssuesList = (data) => {
  console.log('%c %o IssuesList Component','color:rgb(175, 41, 106)',data.data)
  let listIssues = data.data.map( (issue, i) => {
    return (
      <ListItem key={issue.node.url}>
        {issue.node.title}
      </ListItem>
    )
  })
  return (
    <List>{listIssues}</List>
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
const Results = ({issuesList, repoOwner, repoName, validForm, callbackData}) => {
  // console.log('Rendering REsults')
  let conditionalComponent = null;
  let listIssues = null;
  if( !validForm  ){
    conditionalComponent = (
      <Notification
        message={'The Owner and name are required fields'}
        size={'small'}
        status={'critical'}
      />
    )
  }
  else if(issuesList != null){
    conditionalComponent = (
      <IssuesList data={issuesList.repository.issues.edges}/>
    )
  }
  else {
    conditionalComponent = (
      <Query query={GET_REPOSITORY_ISSUES}
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

class Home extends React.Component {
constructor(props){
  super(props);
  this.state = {
    repositoryOwner: '',
    repositoryName:'',
    requestReady: false,
    submitting:false,
    issuesList: null,
    validForm: false,
  }

  this.getIssues = () => {
    console.log('send apollo client');
    console.log(GET_REPOSITORY_ISSUES);
    const {data } = client.query(
      {
        query: GET_REPOSITORY_ISSUES,
        variables:{
          repoOwner:this.state.repositoryOwner,
          repoName: this.state.repositoryName
        } })
        .then(data => console.log({ data }));
  }
  this.handleRepoName = (e) => {
    this.setState({
      repositoryName:e.target.value,
      validForm: false,
    },()=>{this.isReadyToQuery();})
  }
  this.handleRepoOwner = (e) => {
    this.setState({
      validForm: false,
      repositoryOwner:e.target.value,
    },()=>{this.isReadyToQuery();})
  }
  this.handleRequestClick = () => {
    this.setState({
      requestReady:true,
    },()=>{this.isReadyToQuery();})
  }
  this.isReadyToQuery = () =>{
    if(this.state.repositoryName != '' && this.state.repositoryOwner != '' && this.state.requestReady){
      this.setState({
        validForm: true,
      })
    }
  }
  this.callbackData = ( data ) => {
    console.log('Callback Data', data);
    this.setState({
      issuesList: data,
    })
  }
}
  render() {
    return (
      <ApolloProvider client={client}>
        <Box
            a11yTitle={'Github Tracker'}
            align='center'
            alignContent='center'
            appCentered
            justify='center'
            responsive
            margin='large'
            size='large'
            >
            <Heading>Github issue Tracker</Heading>
            <Box
              basis='1/2'
              direction='row'
              >
            <TextInput
              id='repoOwner'
              name='repositoryOwner'
              placeholder='Owner'
              value={this.state.repositoryOwner}
              onDOMChange={this.handleRepoOwner}/>
              <TextInput
                id='repoName'
                name='repositoryName'
                placeholder='Name'
                value={this.state.repositoryName}
                onDOMChange={this.handleRepoName}/>
              </Box>
              <Box
                basis='full'
                margin='small'
                flex={true}
                full='true'
                >
                <Button
                  label="Get the issues!"
                  hoverIndicator='background'
                  onClick={() => {this.handleRequestClick();}}>
                </Button>
             </Box>
          <Results
            issuesList={this.state.issuesList}
            repoOwner={this.state.repositoryOwner}
            repoName={this.state.repositoryName}
            validForm={this.state.validForm}
            callbackData={this.callbackData}/>
        </Box>
      </ApolloProvider>
    );
  }
}

const App = document.getElementById("app");

ReactDOM.render(<Home/>, App);

if (module.hot) {
  module.hot.dispose(function () {
    // module is about to be replaced
  });
module.hot.accept(function () {
    // module or one of its dependencies was just updated
  });
}
