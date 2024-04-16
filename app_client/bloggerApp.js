var app = angular.module('bloggerApp', ['ui.router']);

// Router provider
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '/home.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            .state('blogList', {
                url: '/blogList',
                templateUrl: '/blogList.html',
                controller: 'ListController',
                controllerAs: 'vm'
            })
            .state('blogAdd', {
                url: '/blogAdd',
                templateUrl: '/blogAdd.html',
                controller: 'AddController',
                controllerAs: 'vm'
            })
            .state('blogEdit', {
                url: '/blogEdit',
                templateUrl: '/blogEdit.html',
                controller: 'EditController',
                controllerAs: 'vm'
            })
            .state('blogDelete', {
                url: '/blogDelete',
                templateUrl: '/blogDelete.html',
                controller: 'DeleteController',
                controllerAs: 'vm'
            })
            ;            ;

        $urlRouterProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
]);

//Service for API calls
app.service('BlogService', ['$http', function ($http) {
  var apiBaseUrl = '/api/blogs';

  this.listBlogs = function () {
      return $http.get(apiBaseUrl);
  };

  this.addBlog = function (blog) {
      return $http.post(apiBaseUrl, blog);
  };

  this.getBlog = function (blogId) {
      return $http.get(apiBaseUrl + '/' + blogId);
  };

  this.updateBlog = function (blogId, blog) {
      return $http.put(apiBaseUrl + '/' + blogId, blog);
  };

  this.deleteBlog = function (blogId) {
      return $http.delete(apiBaseUrl + '/' + blogId);
  };
}]);

app.controller('NavigationController', ['$scope', '$location', function($scope, $location) {
  $scope.isActive = function(path) {
    return $location.path() === path;
  };
}]);

//Controllers
app.controller('HomeController', [function () {
  var vm = this;
  vm.title = 'Ram Gurung Blog Page';
  vm.message = 'This is where you find all my Blogs!';
}]);

// Controller for adding blogs
app.controller('AddController', ['$location', 'BlogService', 'authentication',
  function AddController($location, BlogService, authentication) {
      var vm = this;
      vm.blog = {};
      vm.title = 'Add Blog';

      vm.submitBlog = function () {
          console.log('Adding blog:', vm.blog); 

          BlogService.addBlog(vm.blog).then(function (response) {
            vm.message = 'Blog added successfully';
            $location.path('/blogList');
        }, function (error) {
            console.error('Error adding blog:', error);
            vm.message = 'Error adding blog';
        });
    };
}]);

// Controller for listing blogs
app.controller('ListController', ['BlogService', 'authentication',
function ListController(BlogService, authentication) {
  var vm = this;
  vm.title = 'Blog List';

  BlogService.listBlogs().then(function (response) {
      vm.blogs = response.data;
      vm.message = "Blogs found";
  }, function (error) {
      vm.message = 'Error fetching blog ';
  });
}]);

// Controller for editing blogs
app.controller('EditController', ['$stateParams', '$location', 'BlogService', 
  function EditController($stateParams, $location, BlogService) {
      var vm = this;
      vm.blog = {};
      
      vm.editBlog = function () {
          BlogService.updateBlog(vm.blog._id, vm.blog).then(function (response) {
              $location.path('/blogList');
          }, function (error) {
              vm.message = 'Error updating blog: ' + error.message;
          });
      };
  }
]);

// Controller for deleting blogs
app.controller('DeleteController', ['$stateParams', '$location', 'BlogService', 
  function DeleteController($stateParams, $location, BlogService) {
      var vm = this;
      vm.blog = {};
      
      vm.deleteBlog = function () {
          BlogService.deleteBlog(vm.blog._id).then(function (response) {
              $location.path('/blogList');
          }, function (error) {
              vm.message = 'Error deleting blog: ' + error.message;
          });
      };
  }
]);