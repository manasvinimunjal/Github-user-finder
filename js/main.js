var IssueTracker = function() { };

var search = {
  userName: '',
  repos: [],
  selectedRepo: '',
  commits: []
};

var API_ROOT = 'https://api.github.com';

IssueTracker.prototype.init = function() {
  this.bindEvents();
}

IssueTracker.prototype.bindEvents = function() {
  var self = this;
  $('form').on('click', '[type="submit"]', function (e) {
    self.handleSubmit(e);
  });
  $('#view_repos').on('click', 'button', function(e) {
    self.handleViewCommits(e);
  });
  $('#view_repos').on('click', 'button', function() {
    self.launchModal();
  });
  $('.modal').on('click', '.close', function() {
    self.closeModal();
  });
}

IssueTracker.prototype.handleSubmit = function(e) {
  e.preventDefault();
  this.resetRepoList();
  search.userName = $('input[type="text"]').val();
  if (search.userName !== '') { this.getRepos() }
}

IssueTracker.prototype.handleViewCommits = function(e) {
  e.preventDefault();
  search.selectedRepo = $(e.target).attr('data-repo');
  this.getCommits();
}

IssueTracker.prototype.getRepos = function() {
  var self = this;
  $.ajax(API_ROOT + '/users/' + search.userName + '/repos')
  .done(function(response) {
    search.repos = response;
    self.loadRepos();
  }).fail(function(error) {
    self.handleNoReposFound();
  });
}

IssueTracker.prototype.getCommits = function() {
  var self = this;
  $.ajax(API_ROOT + '/repos/' + search.userName + '/' + search.selectedRepo + '/commits?per_page=10')
  .done(function(response) {
    search.commits = response;
    self.loadCommits();
  }).fail(function(error) {
    console.log(error);
  });
}

IssueTracker.prototype.handleNoReposFound = function() {
  search.repos = [];
  search.selectedRepo = '';
  search.commits = [];
  this.resetRepoList();
  $('.repos').append('<h5> No repositories found for ' + search.userName + '!<h5>');
}

IssueTracker.prototype.loadRepos = function() {
  var repo = '';
  var reposList = search.repos
    .sort(function(a,b) { return b.open_issues_count - a.open_issues_count })
    .map(function(repo, i) {
      return '<li>' +
        '<span class="repoName">' + repo.name + '</span><br />' +
        '<span class="issueCount">' + repo.open_issues_count + ' open issues</span><br />' +
        '<button data-repo="' + repo.name + '">Browse commits</button>' +
      '</li>'
    });
  $('#view_repos').append(reposList);
}

IssueTracker.prototype.loadCommits = function() {
  var commitsList = search.commits.map(function(commit, i) {
    return '<div class="commits_wrapper">' +
    '<li>' +
      '<span>' + commit.sha + '</span><br/>' +
      '<span>' + commit.commit.message + '</span>' +
      '<a href="' + commit.html_url + '" target="_blank">View  <i class="bi bi-box-arrow-up-right"></i></a>' +
    '</li>' +
    '</div>'
  });
  $('#modal-content').find('ul').append(commitsList);
}

IssueTracker.prototype.launchModal = function() {
  $('.modal').show();
  $('#overlay').show();
  $('.modal').find('h5').text('Commit history for '+ search.selectedRepo);
  $('body').css('overflow', 'hidden');
}

IssueTracker.prototype.closeModal = function() {
  $('.modal').hide().find('h4').empty();
  $('#modal-content').html('');
  $('#overlay').hide();
  $('body').css('overflow', 'auto');
}

IssueTracker.prototype.resetRepoList = function() {
  $('.repos').find('h3').remove();
  $('#view_repos').html('');
}

$(document).ready(function() {
  var issueTracker = new IssueTracker();
  issueTracker.init();
});
