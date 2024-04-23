var app = angular.module('bloggerApp', ['ui.router']);

//Router provider
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: '/home.html',
            controller: 'HomeController as vm',
            data: { title: 'Home' }
        })
        .state('blogList', {
            url: '/blogList',
            templateUrl: '/blogList.html',
            controller: 'ListController as vm',
            data: { title: 'Blog List' }
        })
        .state('blogAdd', {
            url: '/blogAdd',
            templateUrl: '/blogAdd.html',
            controller: 'AddController as vm',
            data: { title: 'Add New Blog' }
        })
        .state('blogEdit', {
            url: '/blogEdit/:blogid',
            templateUrl: '/blogEdit.html',
            controller: 'EditController as vm',
            data: { title: 'Edit Blog' }
        })
        .state('blogDelete', {
            url: '/blogDelete/:blogid',
            templateUrl: '/blogDelete.html',
            controller: 'DeleteController as vm',
            data: { title: 'Delete Blog' }
        })
        .state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'RegisterController as vm',
            data: { title: 'Register' }
        })
        .state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'LoginController as vm',
            data: { title: 'Login' }
        })

    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

// Service for API calls
app.service('BlogService', ['$http', 'authentication', function ($http, authentication) {
    var apiBaseUrl = '/api/blogs';

    var makeAuthHeader = function () {
        var token = authentication.getToken();
        return {
            headers: {
                Authorization: 'Bearer ' + token
            }
        };
    };

    this.listBlogs = function () {
        return $http.get(apiBaseUrl);
    };

    this.addBlog = function (blog) {
        return $http.post(apiBaseUrl, blog, makeAuthHeader());
    };

    this.getBlog = function (blogId) {
        return $http.get(apiBaseUrl + '/' + blogId);
    };

    this.updateBlog = function (blogId, blog) {
        return $http.put(apiBaseUrl + '/' + blogId, blog, makeAuthHeader());
    };

    this.deleteBlog = function (blogId) {
        return $http.delete(apiBaseUrl + '/' + blogId, makeAuthHeader());
    };
}]);

// Home Controllers
app.controller('HomeController', [function () {
    var vm = this;
    vm.title = 'Ram Gurung Blogs Page';
    vm.message = 'This is where you will find all my Blogs! Go through my web page and play around and feel free to create a accuont with us. This will give you a ability to post and edit your own blogs, also delete them if you would like. Enjoy!';
}]);

// List Controller
app.controller('ListController', ['BlogService', 'authentication',
    function ListController(BlogService, authentication) {
        var vm = this;
        vm.title = 'Blog List';

        vm.isLoggedIn = function () {
            return authentication.isLoggedIn();
        };

        vm.logout = function () {
            authentication.logout();
        };

        vm.currentUser = function () {
            return authentication.currentUser();
        };

        console.log('Is Logged In:', vm.isLoggedIn());
        console.log('Current User:', vm.currentUser());

        BlogService.listBlogs().then(function (response) {
            vm.blogs = response.data;
            vm.message = "Blogs found";
        }, function (error) {
            vm.message = 'Error fetching blog ';
        });
    }]);

// Add Controller
app.controller('AddController', ['$location', 'BlogService', 'authentication',
function AddController($location, BlogService, authentication) {
  var vm = this;
  vm.blog = {};
  vm.title = 'Add Blog';

  vm.submitBlog = function () {
    var currentUser = authentication.currentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('No user is currently logged in.');
      return;
    }

    vm.blog.author = currentUser.name;
    vm.blog.authorEmail = currentUser.email;

    console.log('Adding blog:', vm.blog);

    BlogService.addBlog(vm.blog)
      .then(function (response) {
        vm.message = 'Blog added successfully';
        $location.path('/blogList');
      }, function (error) {
        console.error('Error adding blog:', error);
        vm.message = 'Error adding blog';
      });
  };
}
]);


// Edit Controller
app.controller('EditController', ['$stateParams', '$location', 'BlogService', 'authentication',
    function EditController($stateParams, $location, BlogService, authentication) {
        var vm = this;
        var blogId = $stateParams.blogid;
        vm.blog = {};
        vm.title = 'Edit Blog';

        BlogService.getBlog(blogId).then(function (response) {
            vm.blog = response.data;
        }, function (error) {
            console.error('Error fetching blog:', error);
        });

        vm.editBlog = function () {
            BlogService.updateBlog(blogId, vm.blog).then(function (response) {
                $location.path('/blogList');
            }, function (error) {
                vm.message = 'Error updating blog ' + vm.blogId;
            });
        };
    }]);

// Delete Controller
app.controller('DeleteController', ['$stateParams', '$location', 'BlogService', 'authentication',
    function DeleteController($stateParams, $location, BlogService, authentication) {
        var vm = this;
        vm.blog = {};
        var blogId = $stateParams.blogid;
        vm.title = 'Delete Blog';

        BlogService.getBlog(blogId).then(function (response) {
            vm.blog = response.data;
            vm.message = "Blog found";
        }, function (error) {
            vm.message = 'Error fetching blog' + vm.blogId + 'for deletion';
        });

        vm.deleteBlog = function () {
            BlogService.deleteBlog(blogId).then(function (response) {
                $location.path('/blogList');
            }, function (error) {
                vm.message = 'Error deleting blog ' + vm.blogId;
            });
        };
    }]);
