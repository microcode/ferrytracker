var app = new (FerryTracker.Router.extend({
    initialize: function () {
    },

    routes: {
        "": "showDeparture"
    },


    showDeparture: function () {
        this.showView("#body", new DepartureView({ schedule: this.schedule }));
    }
}));

async.parallel([
    function (callback) {
        $.ajax({
            url: "ferrytracker/data/schedule.json",
            dataType: "json"
        }).done(function (data) {
            app.schedule = new Schedule(data);
        }).always(function () {
            callback();
        });
    }, Template.preload
], function () {
    if (!Backbone.History.started) {
        Backbone.history.start();
    }
});

$(document).ready(function () {
    var appCache = window.applicationCache;
    if (appCache) {
        appCache.addEventListener('updateready', function () {
            toastr.options = {
                "positionClass": "toast-bottom-center",
                "timeOut": 10000,
                "onclick": function () {
                    window.location.reload();
                }
            };
            toastr.warning("Click here to reload.", "Application updated");
        }, false);
    }
});