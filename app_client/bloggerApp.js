var app = angular.module('bloggerApp', ['ui.router']);

// Router provider
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
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
            .state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'LoginController',
                controllerAs: 'loginCtrl'
            })
            .state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'RegisterController',
                controllerAs: 'registerCtrl'
            })

        $urlRouterProvider.otherwise('/home');

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

app.controller('NavigationController', ['$scope', 'authentication', function($scope, authentication) {
    $scope.isLoggedIn = authentication.isLoggedIn;
    $scope.currentUser = authentication.currentUser;
    $scope.isActive = function(path) {
        return $location.path() === path;
    };
    $scope.logout = function() {
        authentication.logout(); 
        $location.path('/home');
    };
}]);



//Controllers
app.controller('HomeController', [function () {
  var vm = this;
  vm.title = 'Ram Gurung Blog Page';
  vm.message = 'This is where you find all my Blogs!';
}]);

// Controller for adding blogs
app.controller('AddController', ['$location', 'BlogService',
  function AddController($location, BlogService) {
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
app.controller('ListController', [ '$http', '$scope', '$interval', 'authentication', 
	function UserListController($http, $scope, $interval, authentication) {
		var vm = this;
		vm.pageHeader = {
			title: 'Blog List'
		};

		// Initially gets list of users								 
		getAllUsers($http)
		  .success(function(data) {
			vm.users = data;
			vm.message = "Blogs list found!";
		  })
		  .error(function (e) {
			vm.message = "Could not get blog of users";
		});

		// Refreshes lists of users periodically					  
		$scope.callAtInterval = function() {
			console.log("Interval occurred");
			getAllUsers($http)
			  .success(function(data) {
				vm.users = data;
				vm.message = "Blogs list found!";
			  })
			  .error(function (e) {
				vm.message = "Could not get blog of users";
			});								  
		}
		$interval( function(){$scope.callAtInterval();}, 3000, 0, true);
									  							  
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
}]);

// Controller for user login
app.controller('LoginController', ['$http', '$state', function ($http, $state) {
    var loginCtrl = this;
    loginCtrl.credentials = {
        email: '',
        password: ''
    };

    loginCtrl.login = function() {
        $http.post('/api/login', loginCtrl.credentials).then(function(response) {
            sessionStorage.setItem('auth-token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
            $state.path('/home');
        }, function(error) {
            loginCtrl.error = 'Login failed: ' + error.data.message;
        });
    };
}]);

// Controller for user registration
app.controller('RegisterController', ['$http', '$state', function ($http, $state) {
    var registerCtrl = this;
    registerCtrl.user = {
        fullName: '',
        email: '',
        password: ''
    };

    registerCtrl.register = function() {
        $http.post('/api/register', registerCtrl.user).then(function(response) {
            $state.path('/login');
        }, function(error) {
            registerCtrl.error = 'Registration failed: ' + error.data.message;
        });
    };
}]);
