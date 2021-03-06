/**
 *
 * DialoguePage
 *
 */

import { CircularProgress, Grid } from '@material-ui/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import qs from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { GROUP_ACCESS_CONTROL } from '../../../common/constants';
import MainTab from '../../components/MainTab';
import Form from './Components/Form';
import AC from '../../utils/accessControl';
import injectSaga from '../../utils/injectSaga';
import saga from './saga';

import {
  makeSelectActions,
  makeSelectAgent,
  makeSelectCategories,
  makeSelectFilteredCategories,
  makeSelectFilteredActions,
  makeSelectKeywords,
  makeSelectActionsPage,
  makeSelectNewSayingActions,
  makeSelectSayings,
  makeSelectSelectedCategory,
  makeSelectTotalSayings,
  makeSelectLocale,
  makeSelectTotalKeywords,
  makeSelectTotalActionsPage,
  makeSelectServerStatus,
  makeSelectDialoguePageFilterSearchSaying,
  makeSelectDialoguePageFilterCategory,
  makeSelectDialoguePageFilterActions,
  makeSelectDialoguePageNumberOfFiltersApplied,
  makeSelectDialoguePageFilterString,
  makeSelectDialoguePageFilterKeywords,
  makeSelectDialoguePageFilterActionIssues,
  makeSelectDialoguePageFilterKeywordIssues,
  makeSelectAgentVersions,
  makeSelectCurrentUser,
  makeSelectLoadingAgentVersion,
  makeSelectTrainTest,
} from '../App/selectors';

import {
  addActionNewSaying,
  addActionSaying,
  addSaying,
  changeActionsPageSize,
  changeKeywordsPageSize,
  changeSayingCategory,
  changeSayingsPageSize,
  clearSayingToAction,
  deleteActionNewSaying,
  deleteActionSaying,
  deleteSaying,
  loadActions,
  loadActionsPage,
  loadAgent,
  loadCategories,
  loadFilteredActions,
  loadFilteredCategories,
  loadKeywords,
  loadSayings,
  resetSayings,
  selectCategory,
  sendSayingToAction,
  tagKeyword,
  toggleChatButton,
  trainAgent,
  untagKeyword,
  addAgentVersion,
  loadAgentVersion,
  updateAgentVersion,
  deleteAgentVersion,
  changeDialoguePageFilterSearchSaying,
  changeDialoguePageFilterCategory,
  changeDialoguePageFilterActions,
  changeDialoguePageNumberOfFiltersApplied,
  changeDialoguePageFilterString,
  resetDialoguePageFilters,
  changeDialoguePageFilterKeywords,
  changeDialoguePageFilterActionIssues,
  changeDialoguePageFilterKeywordIssues,
  toggleConversationBar,
  sendMessage,
  updateSaying
} from '../App/actions';

/* eslint-disable react/prefer-stateless-function */
export class DialoguePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.moveSayingsPageBack = this.moveSayingsPageBack.bind(this);
    this.moveSayingsPageForward = this.moveSayingsPageForward.bind(this);
    this.changeSayingsPage = this.changeSayingsPage.bind(this);
    this.changeSayingsPageSize = this.changeSayingsPageSize.bind(this);
    this.onSearchSaying = this.onSearchSaying.bind(this);
    this.onSearchCategory = this.onSearchCategory.bind(this);
    this.onSearchActions = this.onSearchActions.bind(this);
    this.addSaying = this.addSaying.bind(this);
    this.deleteSaying = this.deleteSaying.bind(this);
    this.initForm = this.initForm.bind(this);
    this.changeKeywordsPage = this.changeKeywordsPage.bind(this);
    this.moveKeywordsPageBack = this.moveKeywordsPageBack.bind(this);
    this.moveKeywordsPageForward = this.moveKeywordsPageForward.bind(this);
    this.onSearchKeyword = this.onSearchKeyword.bind(this);
    this.setNumberOfKeywordsPages = this.setNumberOfKeywordsPages.bind(this);
    this.changeKeywordsPageSize = this.changeKeywordsPageSize.bind(this);
    this.changeActionsPage = this.changeActionsPage.bind(this);
    this.moveActionsPageBack = this.moveActionsPageBack.bind(this);
    this.moveActionsPageForward = this.moveActionsPageForward.bind(this);
    this.onSearchAction = this.onSearchAction.bind(this);
    this.setNumberOfActionsPages = this.setNumberOfActionsPages.bind(this);
    this.changeActionsPageSize = this.changeActionsPageSize.bind(this);
    this.initForm = this.initForm.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  state = {
    selectedTab: qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    }).tab
      ? qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).tab
      : 'sayings',
    filter: this.props.dialoguePageFilterString,
    categoryFilter: '',
    actionFilter: '',
    currentSayingsPage: 1,
    sayingsPageSize: this.props.agent.id ? this.props.agent.settings.sayingsPageSize : 5,
    numberOfSayingsPages: null,
    userSays: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).userSays,
    currentKeywordsPage: 1,
    currentActionsPage: 1,
    keywordsPageSize: this.props.agent.id ? this.props.agent.settings.keywordsPageSize : 5,
    actionsPageSize: this.props.agent.id ? (this.props.agent.settings.actionsPageSize ? this.props.agent.settings.actionsPageSize : 5) : 5,
    numberOfKeywordsPages: null,
    totalKeywords: null,
    numberOfActionsPages: null,
    totalActions: null,
  };

  initForm() {
    const agentSayingsPageSize = this.props.agent.settings.sayingsPageSize;
    this.throttledOnLoadSayings = _.throttle(
      (
        filter = this.props.dialoguePageFilterString,
        currentSayingsPage = this.state.currentSayingsPage,
        pageSize = agentSayingsPageSize,
      ) => {
        this.props.onLoadSayings(filter, currentSayingsPage, pageSize);
      },
      2000,
      { leading: true },
    );

    const locationSearchParams = qs.parse(this.props.location.search);
    const filter = this.props.dialoguePageFilterString;
    const currentSayingsPage = this.state.currentSayingsPage;
    this.setState({
      filter,
      currentSayingsPage,
      pageSize: agentSayingsPageSize,
    });

    if (this.state.selectedTab === 'sayings') {
      this.props.onLoadSayings(filter, currentSayingsPage, agentSayingsPageSize);
    }

    if (this.state.selectedTab === 'keywords') {
      this.setState({
        keywordsPageSize: this.props.agent.settings.keywordsPageSize,
      });
      this.props.onLoadKeywords('', this.state.currentKeywordsPage, this.state.keywordsPageSize);
    }

    if (this.state.selectedTab === 'actions') {
      this.setState({
        actionsPageSize: this.props.agent.settings.actionsPageSize,
      });
      this.props.onLoadActionsPage('', this.state.currentActionsPage, this.state.actionsPageSize);
    }
    this.props.onLoadActions();
    this.props.onLoadCategories();
  }

  componentWillMount() {
    if (this.props.agent.id) {
      this.initForm();
    }
    this.props.onShowChatButton(true);
  }

  componentWillUnmount() {
    this.throttledOnLoadSayings = null;
    this.props.onResetDialoguePageFilters();
  }

  componentDidUpdate(prevProps) {
    if ((!prevProps.agent.id && this.props.agent.id)) {
      this.initForm();
    }
    if (!this.state.numberOfSayingsPages || this.props.totalSayings !== prevProps.totalSayings) {
      this.setState({
        numberOfSayingsPages: Math.ceil(this.props.totalSayings / this.state.sayingsPageSize),
      });
    }
    if (this.props.totalKeywords !== this.state.totalKeywords) {
      this.setState({
        totalKeywords: this.props.totalKeywords,
      });
      this.setNumberOfKeywordsPages(this.state.keywordsPageSize);
    }
    if (this.props.totalActions !== this.state.totalActions) {
      this.setState({
        totalActions: this.props.totalActions,
      });
      this.setNumberOfActionsPages(this.state.actionsPageSize);
    }
    if (this.needSwitchToPreviousPage(this.state.currentSayingsPage, this.props.totalSayings, prevProps.totalSayings, this.state.sayingsPageSize)) {
      const currentSayingsPage = this.state.currentSayingsPage - 1;
      this.changeSayingsPage(currentSayingsPage);
    }
  }

  changeSayingsPage(pageNumber) {
    this.setState({
      currentSayingsPage: pageNumber,
    });
    this.props.onLoadSayings(
      this.props.dialoguePageFilterString,
      pageNumber,
      this.state.sayingsPageSize,
    );
  }

  moveSayingsPageBack() {
    const { currentSayingsPage } = this.state;
    this.changeSayingsPage(currentSayingsPage > 1 ? currentSayingsPage - 1 : currentSayingsPage);
  }

  moveSayingsPageForward() {
    const { currentSayingsPage, numberOfSayingsPages } = this.state;
    this.changeSayingsPage(currentSayingsPage < numberOfSayingsPages ? currentSayingsPage + 1 : currentSayingsPage);
  }

  changeSayingsPageSize(sayingsPageSize) {
    this.setState({
      currentSayingsPage: 1,
      sayingsPageSize,
    });
    this.setState({
      numberOfSayingsPages: Math.ceil(this.props.totalSayings / sayingsPageSize),
    });
    this.props.onChangeSayingsPageSize(this.props.agent.id, sayingsPageSize);
    this.props.onLoadSayings(this.props.dialoguePageFilterString, 1, sayingsPageSize);
  }

  onSearchSaying(ignoreKeywords) {
    this.setState({
      currentSayingsPage: 1,
    });
    this.props.onLoadSayings(this.props.dialoguePageFilterString, 1, this.state.sayingsPageSize, ignoreKeywords);
  }

  onSearchCategory(categoryFilter) {
    this.setState({
      categoryFilter,
    });
    this.props.onLoadFilteredCategories(categoryFilter);
  }

  onSearchActions(actionFilter) {
    this.setState({
      actionFilter,
    });
    this.props.onLoadFilteredActions(actionFilter);
  }

  addSaying(saying) {
    this.setState({
      currentSayingsPage: 1,
    });
    this.props.onAddSaying(this.props.dialoguePageFilterString, 1, this.state.sayingsPageSize, saying);
  }

  deleteSaying(sayingId, categoryId) {
    this.props.onDeleteSaying(this.props.dialoguePageFilterString, this.state.currentSayingsPage, this.state.sayingsPageSize, sayingId, categoryId);
  }

  needSwitchToPreviousPage(currentPage, totalElements, previousStateTotalElements, pageSize) {
    if (previousStateTotalElements != totalElements) {
      return (
        this.isLastElementOfPage(previousStateTotalElements, pageSize) && this.isLastPage(currentPage, previousStateTotalElements, pageSize) && currentPage > 1
      );
    } else {
      return false;
    }
  }

  isLastElementOfPage(totalElements, pageSize) {
    return totalElements % pageSize === 1;
  }

  isLastPage(currentPage, totalElements, pageSize) {
    return currentPage === Math.ceil(totalElements / pageSize);
  }

  setNumberOfKeywordsPages(pageSize) {
    const numberOfKeywordsPages = Math.ceil(this.props.totalKeywords / pageSize);
    this.setState({
      numberOfKeywordsPages,
    });
  }

  setNumberOfActionsPages(pageSize) {
    const numberOfActionsPages = Math.ceil(this.props.totalActions / pageSize);
    this.setState({
      numberOfActionsPages,
    });
  }

  changeKeywordsPage(pageNumber) {
    this.setState({
      currentKeywordsPage: pageNumber,
    });
    this.props.onLoadKeywords(this.state.filter, pageNumber, this.state.keywordsPageSize);
  }

  changeActionsPage(pageNumber) {
    this.setState({
      currentActionsPage: pageNumber,
    });
    this.props.onLoadActionsPage(this.state.filter, pageNumber, this.state.actionsPageSize);
  }

  moveKeywordsPageBack() {
    let newPage = this.state.currentKeywordsPage;
    if (this.state.currentKeywordsPage > 1) {
      newPage = this.state.currentKeywordsPage - 1;
    }
    this.changeKeywordsPage(newPage);
  }

  moveKeywordsPageForward() {
    let newPage = this.state.currentKeywordsPage;
    if (this.state.currentKeywordsPage < this.state.numberOfKeywordsPages) {
      newPage = this.state.currentKeywordsPage + 1;
    }
    this.changeKeywordsPage(newPage);
  }

  changeKeywordsPageSize(keywordsPageSize) {
    this.setState({
      currentKeywordsPage: 1,
      keywordsPageSize,
    });
    this.setNumberOfKeywordsPages(keywordsPageSize);
    this.props.onChangeKeywordsPageSize(this.props.agent.id, keywordsPageSize);
    this.props.onLoadKeywords(this.state.filter, 1, keywordsPageSize);
  }

  onSearchKeyword(filter) {
    this.setState({
      filter,
    });
    this.props.onLoadKeywords(filter, this.state.currentKeywordsPage, this.state.keywordsPageSize);
  }

  moveActionsPageBack() {
    let newPage = this.state.currentActionsPage;
    if (this.state.currentActionsPage > 1) {
      newPage = this.state.currentActionsPage - 1;
    }
    this.changeActionsPage(newPage);
  }

  moveActionsPageForward() {
    let newPage = this.state.currentActionsPage;
    if (this.state.currentActionsPage < this.state.numberOfActionsPages) {
      newPage = this.state.currentActionsPage + 1;
    }
    this.changeActionsPage(newPage);
  }

  changeActionsPageSize(actionsPageSize) {
    this.setState({
      currentActionsPage: 1,
      actionsPageSize,
    });
    this.setNumberOfActionsPages(actionsPageSize);
    this.props.onChangeActionsPageSize(this.props.agent.id, actionsPageSize);
    this.props.onLoadActionsPage(this.state.filter, 1, actionsPageSize);
  }

  onSearchAction(filter) {
    this.setState({
      filter,
    });
    this.props.onLoadActionsPage(filter, this.state.currentActionsPage, this.state.actionsPageSize);
  }

  handleTabChange = (event, value) => {
    this.setState({
      selectedTab: value,
    });
    if (value === 'sayings') {
      this.props.onLoadSayings(
        this.props.dialoguePageFilterString,
        this.state.currentSayingsPage,
        this.state.sayingsPageSize,
      );
    }
    if (value === 'keywords') {
      this.props.onLoadKeywords('', this.state.currentKeywordsPage, this.state.keywordsPageSize);
    }
    if (value === 'actions') {
      this.props.onLoadActionsPage('', this.state.currentActionsPage, this.state.actionsPageSize);
    }
  };

  render() {
    const { currentUser } = this.props;
    const isReadOnly = !AC.validate({ userPolicies: currentUser.simplifiedGroupPolicies, requiredPolicies: [GROUP_ACCESS_CONTROL.AGENT_WRITE] });

    return this.props.agent.id &&
      this.props.agentKeywords &&
      (this.state.selectedTab === 'actions' ||
        (this.state.selectedTab === 'sayings' && this.props.agentKeywords.length === this.props.totalKeywords) ||
        (this.state.selectedTab === 'keywords' && this.props.agentKeywords.length <= this.state.keywordsPageSize)) ? (
        <Grid container>
          <MainTab
            isReadOnly={isReadOnly}
            locale={this.props.locale}
            touched={this.props.touched}
            loading={this.props.loading}
            loadingAgentVersion={this.props.loadingAgentVersion}
            success={this.props.success}
            onSaveAndExit={() => {
              this.submit(true);
            }}
            agentName={this.props.agent.agentName}
            agentGravatar={this.props.agent.gravatar ? this.props.agent.gravatar : 1}
            agentUIColor={this.props.agent.uiColor}
            newAgent={this.state.isNewAgent}
            formError={this.state.formError}
            onFinishAction={this.submit}
            onTrain={this.props.onTrain}
            agentStatus={this.props.agent.status}
            serverStatus={this.props.serverStatus}
            lastTraining={this.props.agent.lastTraining}
            enableTabs={!this.state.isNewAgent}
            selectedTab="dialogue"
            agentForm={Link}
            agentURL={`/agent/${this.props.agent.id}?ref=mainTab`}
            dialogueForm={
              <Form
                handleTabChange={this.handleTabChange}
                selectedTab={this.state.selectedTab}
                actionsPage={this.props.actionsPage}
                onSearchKeyword={this.onSearchKeyword}
                onCreateKeyword={this.props.onCreateKeyword}
                currentKeywordsPage={this.state.currentKeywordsPage}
                numberOfKeywordsPages={this.state.numberOfKeywordsPages}
                changeKeywordsPage={this.changeKeywordsPage}
                changeKeywordsPageSize={this.changeKeywordsPageSize}
                moveKeywordsPageBack={this.moveKeywordsPageBack}
                moveKeywordsPageForward={this.moveKeywordsPageForward}
                onSearchAction={this.onSearchAction}
                onCreateAction={this.props.onCreateAction}
                currentActionsPage={this.state.currentActionsPage}
                numberOfActionsPages={this.state.numberOfActionsPages}
                changeActionsPage={this.changeActionsPage}
                changeActionsPageSize={this.changeActionsPageSize}
                moveActionsPageBack={this.moveActionsPageBack}
                moveActionsPageForward={this.moveActionsPageForward}
                keywordsPageSize={this.state.keywordsPageSize}
                actionsPageSize={this.state.actionsPageSize}
                agentId={this.props.agent.id}
                sayingsPageSize={this.props.agent.settings.sayingsPageSize}
                sayings={this.props.sayings}
                agentKeywords={this.props.agentKeywords}
                agentActions={this.props.agentActions}
                agentCategories={this.props.agentCategories}
                agentFilteredCategories={this.props.agentFilteredCategories}
                agentFilteredActions={this.props.agentFilteredActions}
                onAddSaying={this.addSaying}
                onDeleteSaying={this.deleteSaying}
                onChangeSayingCategory={this.props.onChangeSayingCategory.bind(
                  null,
                  this.state.filter,
                  this.state.currentSayingsPage,
                  this.state.sayingsPageSize,
                )}
                onTagKeyword={this.props.onTagKeyword.bind(null, this.state.filter, this.state.currentSayingsPage, this.state.sayingsPageSize)}
                onUntagKeyword={this.props.onUntagKeyword.bind(null, this.state.filter, this.state.currentSayingsPage, this.state.sayingsPageSize)}
                onAddAction={this.props.onAddAction.bind(null, this.state.filter, this.state.currentSayingsPage, this.state.sayingsPageSize)}
                onDeleteAction={this.props.onDeleteAction.bind(null, this.state.filter, this.state.currentSayingsPage, this.state.sayingsPageSize)}
                onAddNewSayingAction={this.props.onAddNewSayingAction}
                onDeleteNewSayingAction={this.props.onDeleteNewSayingAction}
                onSearchSaying={this.onSearchSaying}
                onSearchCategory={this.onSearchCategory}
                onSearchActions={this.onSearchActions}
                onGoToUrl={this.props.onGoToUrl.bind(null, this.state.filter, this.state.currentSayingsPage, this.state.sayingsPageSize)}
                onSendSayingToAction={this.props.onSendSayingToAction}
                currentSayingsPage={parseInt(this.state.currentSayingsPage)}
                numberOfSayingsPages={this.state.numberOfSayingsPages}
                changeSayingsPage={this.changeSayingsPage}
                moveSayingsPageBack={this.moveSayingsPageBack}
                moveSayingsPageForward={this.moveSayingsPageForward}
                changeSayingsPageSize={this.changeSayingsPageSize}
                onSelectCategory={this.props.onSelectCategory}
                category={this.props.category}
                userSays={this.state.userSays}
                newSayingActions={this.props.newSayingActions}
                onClearSayingToAction={this.props.onClearSayingToAction}
                filter={this.state.filter}
                isReadOnly={isReadOnly}
                onChangeDialoguePageFilterSearchSaying={this.props.onChangeDialoguePageFilterSearchSaying}
                dialoguePageFilterSearchSaying={this.props.dialoguePageFilterSearchSaying}
                onChangeDialoguePageFilterCategory={this.props.onChangeDialoguePageFilterCategory}
                dialoguePageFilterCategory={this.props.dialoguePageFilterCategory}
                onChangeDialoguePageFilterActions={this.props.onChangeDialoguePageFilterActions}
                dialoguePageFilterActions={this.props.dialoguePageFilterActions}
                onChangeDialoguePageNumberOfFiltersApplied={this.props.onChangeDialoguePageNumberOfFiltersApplied}
                dialoguePageNumberOfFiltersApplied={this.props.dialoguePageNumberOfFiltersApplied}
                onResetDialoguePageFilters={this.props.onResetDialoguePageFilters}
                onChangeDialoguePageFilterKeywords={this.props.onChangeDialoguePageFilterKeywords}
                dialoguePageFilterKeywords={this.props.dialoguePageFilterKeywords}
                onChangeDialoguePageFilterString={this.props.onChangeDialoguePageFilterString}
                onChangeDialoguePageFilterActionIssues={this.props.onChangeDialoguePageFilterActionIssues}
                dialoguePageFilterActionIssues={this.props.dialoguePageFilterActionIssues}
                onChangeDialoguePageFilterKeywordIssues={this.props.onChangeDialoguePageFilterKeywordIssues}
                dialoguePageFilterKeywordIssues={this.props.dialoguePageFilterKeywordIssues}
                onToggleConversationBar={this.props.onToggleConversationBar}
                onSendMessage={this.props.onSendMessage}
                trainTest={this.props.trainTest}
                onUpdateSayingData={this.props.onUpdateSayingData}
              />
            }
            reviewURL={`/agent/${this.props.agent.id}/review`}
            reviewForm={Link}
            analyticsForm={Link}
            analyticsURL={`/agent/${this.props.agent.id}/analytics`}
            currentAgent={this.props.agent}
            onAddAgentVersion={this.props.onAddAgentVersion}
            onLoadAgentVersion={this.props.onLoadAgentVersion}
            onUpdateAgentVersion={this.props.onUpdateAgentVersion}
            onDeleteAgentVersion={this.props.onDeleteAgentVersion}
            agentVersions={this.props.agentVersions ? this.props.agentVersions : []}
          />
        </Grid>
      ) : (
        <CircularProgress style={{ position: 'absolute', top: '40%', left: '49%' }} />
      );
  }
}

DialoguePage.propTypes = {
  agent: PropTypes.object,
  serverStatus: PropTypes.string,
  onLoadSayings: PropTypes.func,
  onLoadKeywords: PropTypes.func,
  onLoadActionsPage: PropTypes.func,
  onLoadActions: PropTypes.func,
  onChangeSayingsData: PropTypes.func,
  onDeleteSaying: PropTypes.func,
  onAddAction: PropTypes.func,
  onDeleteAction: PropTypes.func,
  onAddNewSayingAction: PropTypes.func,
  onDeleteNewSayingAction: PropTypes.func,
  onTagKeyword: PropTypes.func,
  onUntagKeyword: PropTypes.func,
  onGoToUrl: PropTypes.func,
  onSendSayingToAction: PropTypes.func,
  onClearSayingToAction: PropTypes.func,
  sayings: PropTypes.array,
  totalSayings: PropTypes.number,
  agentCategories: PropTypes.array,
  agentFilteredCategories: PropTypes.array,
  agentKeywords: PropTypes.array,
  agentActions: PropTypes.array,
  onSelectCategory: PropTypes.func,
  category: PropTypes.string,
  onTrain: PropTypes.func,
  newSayingActions: PropTypes.array,
  location: PropTypes.object,
  keywords: PropTypes.array,
  actionsPage: PropTypes.array,
  onChangeSayingCategory: PropTypes.func,
  onShowChatButton: PropTypes.func,
  currentUser: PropTypes.object,
  onChangeDialoguePageFilterSearchSaying: PropTypes.func,
  dialoguePageFilterSearchSaying: PropTypes.string,
  onChangeDialoguePageFilterCategory: PropTypes.func,
  dialoguePageFilterCategory: PropTypes.string,
  onChangeDialoguePageFilterActions: PropTypes.func,
  dialoguePageFilterActions: PropTypes.array,
  onChangeDialoguePageNumberOfFiltersApplied: PropTypes.func,
  dialoguePageNumberOfFiltersApplied: PropTypes.number,
  onChangeDialoguePageFilterString: PropTypes.func,
  dialoguePageFilterString: PropTypes.string,
  onResetDialoguePageFilters: PropTypes.func,
  onChangeDialoguePageFilterKeywords: PropTypes.func,
  dialoguePageFilterKeywords: PropTypes.array,
  onChangeDialoguePageFilterKeywordIssues: PropTypes.func,
  dialoguePageFilterKeywordIssues: PropTypes.bool,
  onChangeDialoguePageFilterActionIssues: PropTypes.func,
  dialoguePageFilterActionIssues: PropTypes.bool,
  onToggleConversationBar: PropTypes.func,
  onSendMessage: PropTypes.func,
  trainTest: PropTypes.object
};

const mapStateToProps = createStructuredSelector({
  agent: makeSelectAgent(),
  agentVersions: makeSelectAgentVersions(),
  serverStatus: makeSelectServerStatus(),
  sayings: makeSelectSayings(),
  totalSayings: makeSelectTotalSayings(),
  agentCategories: makeSelectCategories(),
  agentFilteredCategories: makeSelectFilteredCategories(),
  agentFilteredActions: makeSelectFilteredActions(),
  agentKeywords: makeSelectKeywords(),
  agentActions: makeSelectActions(),
  actionsPage: makeSelectActionsPage(),
  category: makeSelectSelectedCategory(),
  newSayingActions: makeSelectNewSayingActions(),
  locale: makeSelectLocale(),
  totalKeywords: makeSelectTotalKeywords(),
  totalActions: makeSelectTotalActionsPage(),
  currentUser: makeSelectCurrentUser(),
  loadingAgentVersion: makeSelectLoadingAgentVersion(),
  dialoguePageFilterSearchSaying: makeSelectDialoguePageFilterSearchSaying(),
  dialoguePageFilterCategory: makeSelectDialoguePageFilterCategory(),
  dialoguePageFilterActions: makeSelectDialoguePageFilterActions(),
  dialoguePageNumberOfFiltersApplied: makeSelectDialoguePageNumberOfFiltersApplied(),
  dialoguePageFilterString: makeSelectDialoguePageFilterString(),
  dialoguePageFilterKeywords: makeSelectDialoguePageFilterKeywords(),
  dialoguePageFilterActionIssues: makeSelectDialoguePageFilterActionIssues(),
  dialoguePageFilterKeywordIssues: makeSelectDialoguePageFilterKeywordIssues(),
  trainTest: makeSelectTrainTest(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoadAgent: id => {
      dispatch(loadAgent(id));
    },
    onLoadSayings: (filter, page, pageSize, ignoreKeywords) => {
      dispatch(loadSayings(filter, page, pageSize, ignoreKeywords));
    },
    onLoadFilteredCategories: filter => {
      dispatch(loadFilteredCategories(filter));
    },
    onLoadFilteredActions: filter => {
      dispatch(loadFilteredActions(filter));
    },
    onLoadCategories: () => {
      dispatch(loadCategories());
    },
    onLoadKeywords: (filter, page, pageSize) => {
      dispatch(loadKeywords(filter, page, pageSize));
    },
    onLoadActionsPage: (filter, page, pageSize) => {
      dispatch(loadActionsPage(filter, page, pageSize));
    },
    onCreateKeyword: url => {
      dispatch(push(url));
    },
    onCreateAction: url => {
      dispatch(push(url));
    },
    onChangeKeywordsPageSize: (agentId, pageSize) => {
      dispatch(changeKeywordsPageSize(agentId, pageSize));
    },
    onChangeActionsPageSize: (agentId, pageSize) => {
      dispatch(changeActionsPageSize(agentId, pageSize));
    },
    onLoadActions: () => {
      dispatch(loadActions());
    },
    onAddSaying: (filter, page, pageSize, value) => {
      dispatch(addSaying(filter, page, pageSize, value));
    },
    onDeleteSaying: (filter, page, pageSize, sayingId, categoryId) => {
      dispatch(deleteSaying(filter, page, pageSize, sayingId, categoryId));
    },
    onTagKeyword: (filter, page, pageSize, saying, value, start, end, keywordId, keywordName) => {
      dispatch(tagKeyword(filter, page, pageSize, saying, value, start, end, keywordId, keywordName));
    },
    onUntagKeyword: (filter, page, pageSize, saying, start, end) => {
      dispatch(untagKeyword(filter, page, pageSize, saying, start, end));
    },
    onAddAction: (filter, page, pageSize, saying, actionName) => {
      dispatch(addActionSaying(filter, page, pageSize, saying, actionName));
    },
    onDeleteAction: (filter, page, pageSize, saying, actionName) => {
      dispatch(deleteActionSaying(filter, page, pageSize, saying, actionName));
    },
    onAddNewSayingAction: actionName => {
      dispatch(addActionNewSaying(actionName));
    },
    onDeleteNewSayingAction: actionName => {
      dispatch(deleteActionNewSaying(actionName));
    },
    onGoToUrl: (filter, page, pageSize, tab, url) => {
      dispatch(push(`${url}${url.indexOf('?') > -1 ? '&' : '?'}filter=${filter}&page=${page}&pageSize=${pageSize}&tab=${tab}`));
    },
    onSendSayingToAction: saying => {
      dispatch(sendSayingToAction(saying));
    },
    onClearSayingToAction: () => {
      dispatch(clearSayingToAction());
    },
    onSelectCategory: categoryName => {
      dispatch(selectCategory(categoryName));
    },
    onTrain: () => {
      dispatch(trainAgent());
    },
    onChangeSayingsPageSize: (agentId, pageSize) => {
      dispatch(changeSayingsPageSize(agentId, pageSize));
    },
    onChangeSayingCategory: (filter, page, pageSize, saying, categoryId) => {
      dispatch(changeSayingCategory(filter, page, pageSize, saying, categoryId));
    },
    onResetSayings: () => {
      dispatch(resetSayings());
    },
    onShowChatButton: value => {
      dispatch(toggleChatButton(value));
    },
    onLoadAgentVersion: (versionId, currentAgentId) => {
      dispatch(loadAgentVersion(versionId, currentAgentId));
    },
    onUpdateAgentVersion: (version) => {
      dispatch(updateAgentVersion(version));
    },
    onDeleteAgentVersion: (versionId, currentAgentId) => {
      dispatch(deleteAgentVersion(versionId, currentAgentId));
    },
    onAddAgentVersion: id => {
      dispatch(addAgentVersion(id));
    },
    onChangeDialoguePageFilterSearchSaying: newValue => {
      dispatch(changeDialoguePageFilterSearchSaying(newValue));
    },
    onChangeDialoguePageFilterCategory: newValue => {
      dispatch(changeDialoguePageFilterCategory(newValue));
    },
    onChangeDialoguePageFilterActions: newValue => {
      dispatch(changeDialoguePageFilterActions(newValue));
    },
    onChangeDialoguePageNumberOfFiltersApplied: newValue => {
      dispatch(changeDialoguePageNumberOfFiltersApplied(newValue));
    },
    onChangeDialoguePageFilterString: newValue => {
      dispatch(changeDialoguePageFilterString(newValue));
    },
    onResetDialoguePageFilters: () => {
      dispatch(resetDialoguePageFilters());
    },
    onChangeDialoguePageFilterKeywords: newValue => {
      dispatch(changeDialoguePageFilterKeywords(newValue));
    },
    onChangeDialoguePageFilterKeywordIssues: () => {
      dispatch(changeDialoguePageFilterKeywordIssues())
    },
    onChangeDialoguePageFilterActionIssues: () => {
      dispatch(changeDialoguePageFilterActionIssues())
    },
    onToggleConversationBar: (value) => {
      dispatch(toggleConversationBar(value));
    },
    onSendMessage: (payload) => {
      dispatch(sendMessage(payload))
    },
    onUpdateSayingData: (saying, field, value) => {
      dispatch(updateSaying(saying, field, value))
    }
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withSaga = injectSaga({ key: 'dialogue', saga });

export default compose(
  withSaga,
  withConnect,
)(DialoguePage);
