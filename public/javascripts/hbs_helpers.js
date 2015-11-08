
module.exports = {
	registerHelpers : function( Handlebars ){

		// format date and time
		Handlebars.registerHelper('formatDate', function( dateString ){
			var dateObj = new Date( dateString );
			var hours = dateObj.getHours() > 9 ? dateObj.getHours() : '0' + dateObj.getHours();
			var minutes = dateObj.getMinutes() > 9 ? dateObj.getMinutes() : '0' + dateObj.getMinutes();
			return dateObj.toDateString() + ' ' + hours + ':' + minutes;
		});

		// truncate string
		Handlebars.registerHelper ('truncate', function (str, len) {
        if (str.length > len) {
            var new_str = str.substr (0, len+1);

            while (new_str.length) {
                var ch = new_str.substr ( -1 );
                new_str = new_str.substr ( 0, -1 );

                if (ch == ' ') {
                    break;
                }
            }

            if ( new_str == '' ) {
                new_str = str.substr ( 0, len );
            }

            return new Handlebars.SafeString ( new_str +'...' ); 
        }
        return str;
    });
	}
};
