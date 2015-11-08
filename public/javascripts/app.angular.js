
app = angular.module('MainApp', []);

app.directive('modaldialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-close' ng-click='hideModal()'>X</div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
}); 

app.controller('ModalCtrl', ['$scope', '$window', function($scope, $window) {

  $scope.modalShown = false;

  $scope.toggleModal = function(modalType, itemType, item, itemid) {
    $scope.modalShown = !$scope.modalShown;
    if( $scope.modalShown )
    {
      $scope.modalType = modalType;
      $scope.itemType = itemType;
      $scope.item = item;
      $scope.itemid = itemid;
      $scope.message = upperCaseFirst(modalType) + ' ' + itemType + ' - ' + item + '?';
      $scope.confirm = upperCaseFirst(modalType); // OK, button text
      $scope.reject = 'Cancel'; // NO, button text
    }
    
  };

  $scope.modalConfirm = function() {
    $window.location.href = '/' + $scope.itemType + 's/' + $scope.modalType + '/' + $scope.itemid;
    $scope.modalShown = 0;
  };

  $scope.modalReject = function() {
    $scope.modalShown = 0;
  };
}]);


app.controller('SelectCtrl', ['$scope', '$http', '$window', function($scope, $http, $window) {

  $scope.init = function( groupid )
  {
    // constructor for controller
    $scope.groupid = groupid;
    $http({
      method: 'POST',
      url: 'http://localhost:3000/groups/listforedit/',
      data: { groupid: $scope.groupid }
    }).then(function successCallback(response){
        $scope.availablecontacts = response.data.contacts;
        $scope.selectedcontacts = response.data.members;
      }, function errorCallback(response){

    });
  };

  $scope.moveItem = function(items, from, to){

    angular.forEach(items, function(item){
      angular.forEach(from, function(contact){
        if(contact._id === item){
          idx = from.indexOf(contact);
          if (idx != -1) {
              from.splice(idx, 1);
              to.push(contact);      
          }
        }
      });
    });
  };

  $scope.moveAll = function(from, to){

      angular.forEach(from, function(item){
          to.push(item);
      });
      from.length = 0;
  };

  $scope.saveChanges = function(){
    // console.log( $scope.selectedcontacts );
    $http({
      method: 'POST',
      url: 'http://localhost:3000/groups/editsave/',
      data: { groupid: $scope.groupid, members: $scope.selectedcontacts }
    }).then(function successCallback(response){
        if( typeof response.data.redirect == 'string' )
        {
          window.location = response.data.redirect
        }
      }, function errorCallback(response){

    });
  };

}]);

function upperCaseFirst( str )
{
  return str.charAt(0).toUpperCase() + str.slice(1);
}
