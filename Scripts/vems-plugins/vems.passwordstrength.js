(function ($) {
    var passwordStrength = function (elem, options) {
        this.elem = elem;

        var inlineOptions = this.elem.data("plugin-options");

        this.options = $.extend({}, $.fn.passwordStrength.defaults, options, inlineOptions);

    };

    passwordStrength.prototype = {

        init: function () {
            var self = this;
            var el = self.elem;

            progressBar = $("<div class='col-xs-8 col-sm-8 col-md-8'>" +
                "<div class='progress password-guage'>" +
                        "<div class='progress-bar progress-bar-danger' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'>" +
                            "<span class='sr-only'>weak password</span>" +
                        "</div>" +
                "</div>");

            var progressBarContainer = $("<div class='password-guage-container row'></div>")
                .css('margin-top', self.options.topMargin)
                .height(30)
                .append(progressBar)
                .append($("<div class='col-xs-4 col-sm-4 col-md-4'></div>").append($("<div class='progress-gauge-label'></div>").html(self.options.passwordStrengthLabel)));

            el.parent().append(progressBarContainer);

            el.on('keyup', function () {
                var progressElement = progressBar.find('.progress-bar');
                var srSpan = progressBar.find('.sr-only');
                var progressLabelElement = progressElement.parent().parent().parent().find('.progress-gauge-label');

                var strengthScore = checkPasswordStrength($(el).val());

                if (strengthScore >= self.options.strongThreshold) { // Strong
                    strengthScore = strengthScore > 100 ? 100 : strengthScore;

                    progressElement.removeClass().addClass('progress-bar').addClass('progress-bar-success');
                    progressElement.width(strengthScore + '%').attr('aria-valuenow', strengthScore);

                    progressLabelElement.html(self.options.strongLabel);
                    srSpan.text('strong password');
                } else if (strengthScore >= self.options.weakThreshold && strengthScore <= self.options.strongThreshold) { // Average
                    progressElement.removeClass().addClass('progress-bar').addClass('progress-bar-warning');
                    progressElement.width(strengthScore + '%').attr('aria-valuenow', strengthScore);

                    progressLabelElement.text(self.options.averageLabel);
                    srSpan.text('average password');
                } else { // Weak
                    progressElement.removeClass().addClass('progress-bar').addClass('progress-bar-danger');
                    progressElement.width(strengthScore + '%').attr('aria-valuenow', strengthScore);

                    progressLabelElement.text(self.options.weakLabel);
                    srSpan.text('weak password');
                }
            });

            return this;
        }
    }

    var progressBar;

    var checkPasswordStrength = function (password) {
        var score = 0;

        if (!password || password.length === 0) {
            return score;
        }

        if (password.length <= 6) {
            return password.length;
        }

        var chars = {};

        for (var i = 0; i < password.length; i++) {
            var char = password[i];

            if (chars[char]) {
                chars[char] = chars[char] + 1;
            } else {
                chars[char] = 1;
            }

            // only count a letter twice at most
            if (chars[char] <= 2) {
                score += 1;
            }
        }

        // points for using a character only once
        for (var char in chars) {
            switch (chars[char]) {
                case 1:
                    score += 1;
                    break;

            }
        }

        var numbers = /\d/.test(password);
        var specialChars = /\W/.test(password);
        var upperCase = /[A-Z]/.test(password);
        var lowerCase = /[a-z]/.test(password);

        // points if they use multiple types of characters
        score += Math.pow(numbers + specialChars + upperCase + lowerCase, 2) * 2;

        // password of higher length get bonus points for entropy
        if (password.length >= 10) {
            score += (password.length - 8) * 5;
        }

        if (score >= 50) {
            return score;
        }

        if (score <= 60 && score >= 30) {
            return score;
        }

        return score;
    };

    var updateOption = function (option, value, data) {
        if (data.options.hasOwnProperty(option)) {
            data.options[option] = value;
            data.init();
        } else {
            console.log('The password strength plugin does not have a(n) "' + option + '" option to update.')
        }
    }

    $.fn.passwordStrength = function (options) {
        var self = this;
        var _data = self.data("vems_passwordStrength");

        var _current;

        if (typeof options == "string") {
            updateOptions(options, arguments[1], _data);
            return;
        }

        if (_data) {
            return _data;
        }

        this.each(function () {
            var c = new passwordStrength($(this), options).init();

            var container = self.data("vems_passwordStrength", c);
            _current = _current ? _current.add(container) : container;
        });

        return _current ? _current : self;
    };

    $.fn.passwordStrength.defaults = {
        weakThreshold: 30,
        strongThreshold: 60,
        gaugeWidth: 300,
        topMargin: 10,
        passwordStrengthLabel: "Password Strength",
        weakLabel: "Weak",
        averageLabel: "Average",
        strongLabel: "Strong"
    }

})(jQuery);
