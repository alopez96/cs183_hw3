// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };


    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};


    function get_memos_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return memos_url + "?" + $.param(pp);
    }




    self.get_memos = function () {
        $.getJSON(get_memos_url(0, 100), function (data) {
            self.vue.memos = data.memos;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            enumerate(self.vue.memos);
        })
    };



    self.get_more = function () {
        var num_memos = self.vue.memos.length;        //store the number of tracks
        $.getJSON(get_memos_url(num_memos, num_memos + 10)/*get 10 tracks at a time*/, function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.memos, data.memos);
            enumerate(self.vue.memos);
        });
    };


    self.add_memo_button = function () {
        // The button to add a track has been pressed.
        self.vue.is_adding_memo = !self.vue.is_adding_memo;
    };



    self.add_memo = function () {
        // submit the memo info.
          $.post(add_memo_url,
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo,
            },
            function (data) {
                //$.web2py.enableElement($("#add_memo_submit"));
                self.vue.memos.unshift(data.memo);
                enumerate(self.vue.memos);
            });
    };


    self.delete_memo = function(memo_idx) {
        $.post(del_memo_url,
            { memo_id: self.vue.memos[memo_idx].id },
            function () {
                self.vue.memos.splice(memo_idx, 1);
                enumerate(self.vue.memos);
            }
        )
    };



    self.edit_toggle = function(is_edit){
        self.vue.is_editing = is_edit;
        if(!is_edit){
            //save the value, sending it to the server
            console.log("the user saved value " + self.vue.my_string);
        }
    }

    // self.edit_memo = function(memo_idx){
    //     var a_memo = self.vue.memos[memo_idx];
    //     $.post(edit_memo_url,
    //         {
    //             memo_id: a_memo.id,
    //             title: a_memo.title,
    //             memo: a_memo.memo,
    //         },
    //         function(){
    //             self.vue.is_editing = false;
    //             self.vue.memos[memo_idx].memo = self.vue.form_memo;
    //             self.vue.memos[memo_idx].title = self.vue.form_title;
    //         })
    // }



    self.public_toggle = function (memo_idx) {
        // self.vue.selected_id = memo_idx;
        // self.vue.is_public = !self.vue.is_public;
        var a_memo = self.vue.memos[memo_idx];
        a_memo.is_public = !a_memo.is_public;
        $.post(toggle_public_url,
            {memo_id: a_memo.id},
            function(){
                enumerate(self.vue.memos);
            })
    };






    self.cancel_add_memo = function() {
        self.vue.is_adding_memo_info = false;
        self.vue.is_adding_memo = false;
        $("div#uploader_div").hide();
        $.post(cleanup_url); // Cleans up any incomplete uploads.
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            my_string: "my string",
            is_adding_memo: false,
            is_adding_memo_info: false,
            is_editing: false,
            memos:[],
            logged_in: false,
            has_more: false,
            form_title: null,
            form_memo: null,
            is_public: false,
            selected_id: -1
        },
        methods: {
            add_memo_button: self.add_memo_button,
            add_memo: self.add_memo,
            edit_memo: self.edit_memo,
            public_toggle: self.public_toggle,
            edit_toggle: self.edit_toggle,
            get_more: self.get_more,
            delete_memo: self.delete_memo
        }

    });


    //call get_list
    self.get_memos();
    $("#vue-div").show();
    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
