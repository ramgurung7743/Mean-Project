var app = angular.module('bloggerApp', ['ui.router']);

//Router provider
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: '/home.html',
            controller: 'HomeController',
            controllerAs: 'vm',
            data: { title: 'Home' }
        })
        .state('blogList', {
            url: '/blogList',
            templateUrl: '/blogList.html',
            controller: 'ListController',
            controllerAs: 'vm',
            data: { title: 'Blog List' }
        })
        .state('blogAdd', {
            url: '/blogAdd',
            templateUrl: '/blogAdd.html',
            controller: 'AddController',
            controllerAs: 'vm',
            data: { title: 'Add New Blog' }
        })
        .state('blogEdit', {
            url: '/blogEdit/:blogid',
            templateUrl: '/blogEdit.html',
            controller: 'EditController',
            controllerAs: 'vm',
            data: { title: 'Edit Blog' }
        })
        .state('blogDelete', {
            url: '/blogDelete/:blogid',
            templateUrl: '/blogDelete.html',
            controller: 'DeleteController',
            controllerAs: 'vm',
            data: { title: 'Delete Blog' }
        })
        .state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm',
            data: { title: 'Register' }
        })
        .state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            data: { title: 'Login' }
        })
        .state('blogView', {
            url: '/blogView/:blogid',
            templateUrl: '/blogView.html',
            controller: 'ViewController',
            controllerAs: 'vm',
            data: { title: 'View Blog' }
        });

    // Default fallback for unmatched urls
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}]);

//Service for API calls
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

    this.addComment = function (blogId, comment) {
        return $http.post(apiBaseUrl + '/' + blogId + '/comments', comment, makeAuthHeader());
    };

    this.getComments = function (blogId) {
        return $http.get(apiBaseUrl + '/' + blogId + '/comments');
    };

    this.addReply = function (blogId, commentId, reply) {
        return $http.post(apiBaseUrl + '/' + blogId + '/comments/' + commentId + '/replies', reply, makeAuthHeader());
    };

    this.likeComment = function (blogId, commentId) {
        return $http.post(apiBaseUrl + '/' + blogId + '/comments/' + commentId + '/like', {}, makeAuthHeader());
    };

    this.dislikeComment = function (blogId, commentId) {
        return $http.post(apiBaseUrl + '/' + blogId + '/comments/' + commentId + '/dislike', {}, makeAuthHeader());
    };
}]);

//Controllers
app.controller('HomeController', [function () {
    var vm = this;
    vm.title = 'Ram Gurung Blogs Page';
    vm.message = 'This is where you will find my Blogs!';
}]);

//Controller for listing blogs
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

// Controller for viewing a blog
app.controller('ViewController', ['$stateParams', 'BlogService', 'authentication', function ViewController($stateParams, BlogService, authentication) {
    var vm = this;
    vm.blog = {};
    vm.newCommentText = '';
    vm.newReplyTexts = {}; 
    vm.showButtons = false;

    BlogService.getBlog($stateParams.blogid).then(function (response) {
        vm.blog = response.data;
    }, function (error) {
        console.error('Error fetching blog:', error);
    });

    // Function to cancel the reply
    vm.cancelReply = function(commentId) {
        vm.newReplyTexts[commentId] = '';
        var commentIndex = vm.blog.comments.findIndex(c => c._id === commentId);
        if(commentIndex >= 0) {
            vm.blog.comments[commentIndex].showReply = false;
        }
    };

    vm.addComment = function () {
        var comment = {
            commentText: vm.newCommentText,
            author: authentication.currentUser().name,
            authorEmail: authentication.currentUser().email
        };
        BlogService.addComment($stateParams.blogid, comment).then(function (response) {
            vm.blog.comments.push(response.data);
            vm.newCommentText = ''; 
            vm.showButtons = false;
        }, function (error) {
            console.error('Error adding comment:', error);
        });
    };

    vm.cancelComment = function () {
        vm.newCommentText = '';
        vm.showButtons = false;
    };

    vm.checkBlur = function () {
        if(!vm.newCommentText.trim()) {
            vm.showButtons = false;
        }
    };

    // Add a reply to a specific comment
    vm.addReply = function (commentId) {
        var reply = {
            commentText: vm.newReplyTexts[commentId],
            author: authentication.currentUser().name,
            authorEmail: authentication.currentUser().email
        };
        BlogService.addReply($stateParams.blogid, commentId, reply).then(function (response) {
            var comment = vm.blog.comments.find(c => c._id === commentId);
            if (comment) {
                comment.replies.push(response.data);
            }
            vm.newReplyTexts[commentId] = '';
        }, function (error) {
            console.error('Error adding reply:', error);
        });
    };

    vm.likeComment = function (comment) {
        var hasAlreadyLiked = vm.hasLiked(comment);
        BlogService.likeComment($stateParams.blogid, comment._id)
            .then(function (response) {
                if (hasAlreadyLiked) {
                    comment.likes--;
                } else {
                    comment.likes++;
                    if (vm.hasDisliked(comment)) {
                        comment.dislikes--;
                    }
                }
                updateReactions(comment, 'like', hasAlreadyLiked);
            })
            .catch(function (error) {
                console.error('Error processing like:', error);
            });
    };

    vm.dislikeComment = function (comment) {
        var hasAlreadyDisliked = vm.hasDisliked(comment);
        BlogService.dislikeComment($stateParams.blogid, comment._id)
            .then(function (response) {
                if (hasAlreadyDisliked) {
                    comment.dislikes--;
                } else {
                    comment.dislikes++;
                    if (vm.hasLiked(comment)) {
                        comment.likes--;
                    }
                }
                updateReactions(comment, 'dislike', hasAlreadyDisliked);
            })
            .catch(function (error) {
                console.error('Error processing dislike:', error);
            });
    };

    vm.hasLiked = function (comment) {
        var userId = authentication.currentUser()._id;
        return comment.userReactions && comment.userReactions.some(function (reaction) {
            return reaction.userId === userId && reaction.reaction === 'like';
        });
    };

    vm.hasDisliked = function (comment) {
        var userId = authentication.currentUser()._id;
        return comment.userReactions && comment.userReactions.some(function (reaction) {
            return reaction.userId === userId && reaction.reaction === 'dislike';
        });
    };

    // Utility function to update the reactions array
    function updateReactions(comment, reactionType, hasAlreadyReacted) {
        var userId = authentication.currentUser()._id;
        if (hasAlreadyReacted) {
            comment.userReactions = comment.userReactions.filter(function (reaction) {
                return reaction.userId !== userId;
            });
        } else {
            var existingReaction = comment.userReactions.find(function (reaction) {
                return reaction.userId === userId;
            });
            if (existingReaction) {
                existingReaction.reaction = reactionType;
            } else {
                comment.userReactions.push({
                    userId: userId,
                    reaction: reactionType
                });
            }
        }
    }

    vm.isLoggedIn = function () {
        return authentication.isLoggedIn();
    };
}]);

// Controller for adding blogs
a// Controller for adding blogs
app.controller('AddController', ['$location', 'BlogService', 'authentication',
function AddController($location, BlogService, authentication) {
  var vm = this;
  vm.blog = {};
  vm.title = 'Add Blog';

  vm.submitBlog = function () {
    var currentUser = authentication.currentUser();
    console.log('Current user:', currentUser); // Add this to log the current user

    if (!currentUser) {
      console.error('No user is currently logged in.');
      // Optionally handle the situation where no user is logged in, such as redirecting to the login page
      // $location.path('/login');
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


// Controller for editing blogs
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

// Controller for deleting blogs
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