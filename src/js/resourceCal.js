/*!
 * Datepickk
 * Docs & License: https://crsten.github.com/datepickk
 * (c) 2016 Carsten Jacobsen
 */
(function () {

    function ResourceCal(args) {
        ResourceCal.numInstances = (ResourceCal.numInstances || 0) + 1;
        var that = this;
        var eventName = 'click';
        var selectedDates = [];
        var selectedAmount = 0;

        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth() + 1;

        var languages = {
            no: {
                monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
                dayNames: ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'],
                weekStart: 1,
                startLabel: 'Start',
                endLabel: 'End',
                amountLabel: 'Amount',
                datePlaceholder: 'Date',
                timePlaceholder: 'Time'
            },
            se: {
                monthNames: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
                dayNames: ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö'],
                weekStart: 1,
                startLabel: 'Start',
                endLabel: 'End',
                amountLabel: 'Amount',
                datePlaceholder: 'Date',
                timePlaceholder: 'Time'
            },
            ru: {
                monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
                dayNames: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
                weekStart: 1,
                startLabel: 'Start',
                endLabel: 'End',
                amountLabel: 'Amount',
                datePlaceholder: 'Date',
                timePlaceholder: 'Time'
            },
            en: {
                monthNames: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
                dayNames: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
                weekStart: 0,
                startLabel: 'Start',
                endLabel: 'End',
                amountLabel: 'Amount',
                datePlaceholder: 'Date',
                timePlaceholder: 'Time'
            },
            de: {
                monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                weekStart: 1,
                startLabel: 'Beginn',
                endLabel: 'Ende',
                amountLabel: 'Verfügbare Anzahl',
                datePlaceholder: 'Datum',
                timePlaceholder: 'Uhrzeit'
            }
        };

        /*Language aliases*/
        languages.nb = languages.no;
        languages.nn = languages.no;

        var range = false;
        var maxSelections = null;
        var container = document.body;
        var opened = false;
        var months = 1;
        var closeOnSelect = false;
        var button = null;
        var title = null;
        var onNavigation = null;
        var onClose = null;
        var onConfirm = null;
        var closeOnClick = true;
        var inline = false;
        var lang = 'en';
        var onSelect = null;
        var disabledDates = [];
        var disabledDays = [];
        var highlight = [];
        var tooltips = {};
        var daynames = true;
        var today = true;
        var startDate = null;
        var minDate = null;
        var maxDate = null;
        var weekStart = null;
        var locked = false;

        function generateDaynames() {
            that.el.days.innerHTML = '';
            var ws = (weekStart !== null) ? weekStart : languages[lang].weekStart;
            if (daynames) {
                for (var x = 0; x < months && x < 3; x++) {
                    var weekEl = document.createElement('div');
                    weekEl.setAttribute('class', 'd-week');
                    for (var i = 0; i < 7; i++) {
                        var dayNameIndex = (i + ws > languages[lang].dayNames.length - 1) ? i + ws - languages[lang].dayNames.length : i + ws;

                        var dayEl = document.createElement('div');
                        var dayTextEl = document.createElement('p');
                        dayTextEl.innerHTML = languages[lang].dayNames[dayNameIndex];

                        dayEl.appendChild(dayTextEl);
                        weekEl.appendChild(dayEl);
                    }

                    that.el.days.appendChild(weekEl);
                }
            }
        }

        function generateYears() {
            [].slice.call(that.el.yearPicker.childNodes).forEach(function (node, index) {
                node.innerHTML = "'" + (currentYear + parseInt(node.getAttribute('data-year'))).toString().substring(2, 4);
            })
        }

        function generateInputs() {
            that.el.tables.innerHTML = '';
            for (var x = 0; x < months; x++) {
                var container = document.createElement('div');
                container.setAttribute('class', 'd-table');
                for (var i = 0; i < 42; i++) {
                    var input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = ResourceCal.numInstances + '-' + x + '-d-day-' + i;
                    var label = document.createElement('label');
                    label.setAttribute("for", ResourceCal.numInstances + '-' + x + '-d-day-' + i);

                    var text = document.createElement('text');

                    var tooltip = document.createElement('span');
                    tooltip.setAttribute('class', 'd-tooltip');


                    container.appendChild(input);
                    container.appendChild(label);

                    label.appendChild(text);
                    label.appendChild(tooltip);

                    input.addEventListener(eventName, function (event) {
                        if (locked) {
                            event.preventDefault();
                        }
                    });
                    input.addEventListener('change', inputChange);
                }

                that.el.tables.appendChild(container);
            }

            that.el.tables.addEventListener('mouseover', highlightLegend);
            that.el.tables.addEventListener('mouseout', highlightLegend);

            function highlightLegend(e) {
                if (e.target.nodeName !== 'LABEL') return;

                var legendIds = (e.target.getAttribute('data-legend-id')) ? e.target.getAttribute('data-legend-id').split(' ') : [];
                if (!legendIds.length) return;

                legendIds.forEach(function (legendId) {
                    var element = that.el.legend.querySelector('[data-legend-id="' + legendId + '"]');
                    if (e.type == 'mouseover' && element) {
                        var color = (element.getAttribute('data-color')) ? hexToRgb(element.getAttribute('data-color')) : null;
                        element.setAttribute('style', 'background-color:rgba(' + color.r + ',' + color.g + ',' + color.b + ',0.35);');
                    } else if (element) {
                        element.removeAttribute('style');
                    }
                });

                function hexToRgb(hex) {
                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                }
            }
        }

        function generateFormFields() {

            var startDateField = generateDateField(
                'start', languages[lang].startLabel, languages[lang].datePlaceholder, languages[lang].timePlaceholder
            );
            var endDateField = generateDateField(
                'end', languages[lang].endLabel, languages[lang].datePlaceholder, languages[lang].timePlaceholder
            );

            var amountSelectField = generateSelectField('amount', languages[lang].amountLabel);

            that.el.form.appendChild(startDateField);
            that.el.form.appendChild(endDateField);
            that.el.form.appendChild(amountSelectField);

            function generateTimeFormFieldFallback(name, timeInput) {

                function generateOptions(start, max, step, select) {
                    for (var i = start; i <= max; i = i = i + step) {
                        var option = document.createElement('option');
                        option.textContent = (i < 10) ? ('0' + i) : i;
                        select.appendChild(option);
                    }
                }

                function setMinutesToZero() {
                    minuteSelect.value = '00';
                }

                function setTime() {
                    timeInput.value = hourSelect.value + ':' + minuteSelect.value;
                }

                function getTime() {
                    var time = this.value.split(':');
                    hourSelect.value = time[0];
                    minuteSelect.value = time[1];
                }

                var fallbackTime = document.createElement('div');
                fallbackTime.setAttribute('class', 'd-form-field-t-fallback');

                var hourSpan = document.createElement('span');
                var hourLabel = document.createElement('label');
                hourLabel.setAttribute('for', 'hour');
                var hourSelect = document.createElement('select');
                hourSelect.setAttribute('id', 'hour');
                hourSelect.setAttribute('name', 'hour');
                hourSelect.setAttribute('data-time-field', name + '-hour');
                hourSelect.disabled = true;
                generateOptions(0, 23, 1, hourSelect);

                hourSelect.value = name === 'start' ? '00' : '23';
                hourSelect.onchange = setMinutesToZero;
                hourSelect.onchange = setTime;

                hourSpan.appendChild(hourLabel);
                hourSpan.appendChild(hourSelect);

                var minuteSpan = document.createElement('span');
                var minuteLabel = document.createElement('label');
                minuteLabel.setAttribute('for', 'minute');
                var minuteSelect = document.createElement('select');
                minuteSelect.setAttribute('id', 'minute');
                minuteSelect.setAttribute('name', 'minute');
                minuteSelect.setAttribute('data-time-field', name + '-minute');
                minuteSelect.disabled = true;
                generateOptions(0, 55, 5, minuteSelect);

                minuteSelect.value = name === 'start' ? '00' : '55';
                minuteSelect.onchange = setTime;

                minuteSpan.appendChild(minuteLabel);
                minuteSpan.appendChild(minuteSelect);

                fallbackTime.appendChild(hourSpan);
                fallbackTime.appendChild(minuteSpan);

                timeInput.onchange = getTime;

                return fallbackTime;
            }

            function generateDateField(name, title, datePlaceholder, timePlaceholder) {
                var field = document.createElement('div');
                field.setAttribute('class', 'd-form-field d-form-field-half');

                var fieldHeadline = document.createElement('div');
                fieldHeadline.setAttribute('class', 'd-form-field-h');
                fieldHeadline.innerText = title;
                field.appendChild(fieldHeadline);

                var fieldDate = document.createElement('div');
                fieldDate.setAttribute('class', 'd-form-field-d');
                fieldDate.setAttribute('data-date-field', name);
                fieldDate.setAttribute('value', new Date());
                fieldDate.innerText = datePlaceholder;
                field.appendChild(fieldDate);

                var fieldTime = document.createElement('input');
                fieldTime.setAttribute('class', 'd-form-field-t');
                fieldTime.setAttribute('data-time-field', name);
                fieldTime.setAttribute('type', 'time');
                fieldTime.setAttribute('value', name === 'start' ? '00:00' : '23:55');
                fieldTime.setAttribute('placeholder', timePlaceholder);
                fieldTime.disabled = true;

                field.appendChild(fieldTime);

                if (fieldTime.type === 'text') {
                    fieldTime.style.display = 'none';

                    field.appendChild(generateTimeFormFieldFallback(name, fieldTime));
                }

                fieldTime.addEventListener('change', timeChange);

                return field;
            }

            function generateSelectField(name, title) {
                var field = document.createElement('div');
                field.setAttribute('class', 'd-form-field');

                var fieldHeadline = document.createElement('div');
                fieldHeadline.setAttribute('class', 'd-form-field-h d-form-field-inline');
                fieldHeadline.innerText = title;
                field.appendChild(fieldHeadline);

                var fieldAmount = document.createElement('select');
                fieldAmount.setAttribute('class', 'd-form-field-s d-form-field-inline');
                fieldAmount.setAttribute('data-field', name);
                fieldAmount.disabled = true;

                var placeholderOption = document.createElement('option');
                placeholderOption.value = '0';
                placeholderOption.selected = true;
                placeholderOption.innerText = '0';

                fieldAmount.appendChild(placeholderOption);
                fieldAmount.addEventListener('change', amountChange);

                field.appendChild(fieldAmount);

                return field;
            }

        }

        function generateLegends() {
            var start = new Date(that.el.tables.childNodes[0].childNodes[0].getAttribute('data-date'));
            var end = new Date(that.el.tables.childNodes[months - 1].childNodes[82].getAttribute('data-date'));
            var _highlights = highlight.filter(function (x) {
                for (var m = 0; m < x.dates.length; m++) {
                    if (x.dates[m].start < end && x.dates[m].end > start) {
                        return true;
                    }
                }
                return false;
            });
            var legends = [];
            for (var l = 0; l < _highlights.length; l++) {
                if ('legend' in _highlights[l] && _highlights[l].legend) {
                    var oldLegend = container.querySelector('.d-legend-item[data-legend="' + _highlights[l].legend + '"][data-color="' + _highlights[l].backgroundColor + '"]');
                    if (oldLegend == null) {
                        var legendItem = document.createElement('p');
                        legendItem.setAttribute('class', 'd-legend-item');
                        legendItem.setAttribute('data-legend', _highlights[l].legend);
                        legendItem.setAttribute('data-legend-id', highlight.indexOf(_highlights[l]));
                        legendItem.setAttribute('data-color', _highlights[l].backgroundColor);
                        var legendItemPoint = document.createElement('span');
                        legendItemPoint.setAttribute('style', 'background-color:' + _highlights[l].backgroundColor);

                        legendItem.appendChild(legendItemPoint);

                        that.el.legend.appendChild(legendItem);
                        legendItem.addEventListener('mouseover', hoverLegend);
                        legendItem.addEventListener('mouseout', hoverLegend);
                        legends.push(legendItem);
                    } else {
                        legends.push(oldLegend);
                    }
                }
            }

            [].slice.call(that.el.legend.querySelectorAll('.d-legend-item')).forEach(function (item) {
                if (legends.indexOf(item) < 0) {
                    item.removeEventListener('mouseover', hoverLegend);
                    item.removeEventListener('mouseout', hoverLegend);
                    that.el.legend.removeChild(item);
                }
            });

            function hoverLegend(e) {
                [].slice.call(that.el.tables.querySelectorAll('[data-legend-id*="' + this.getAttribute('data-legend-id') + '"]')).forEach(function (element) {
                    if (e.type == 'mouseover') element.classList.add('legend-hover');
                    else element.classList.remove('legend-hover');
                });
            }
        }

        function parseMonth(month) {
            if (month > 11) month -= 12;
            else if (month < 0) month += 12;
            return month;
        }

        function generateDates(year, month) {
            var monthElements = that.el.querySelectorAll('.d-table');
            var ws = (weekStart !== null) ? weekStart : languages[lang].weekStart;

            [].slice.call(that.el.querySelectorAll('.d-table')).forEach(function (element, index) {
                var days = new Date(year, month + index, 0).getDate();
                var daysLast = new Date(year, month + index - 1, 0).getDate();
                var startDay = new Date(year, month + index - 1, 1).getDay();
                var startDate = null;
                var endDate = null;
                if (startDay - ws < 0) {
                    startDay = 7 - ws;
                } else {
                    startDay -= ws;
                }
                var monthText = languages[lang].monthNames[parseMonth(month - 1 + index)];
                element.setAttribute('data-month', monthText);

                [].slice.call(element.querySelectorAll('.d-table input')).forEach(function (inputEl, i) {
                    var labelEl = inputEl.nextSibling;

                    inputEl.checked = false;
                    inputEl.removeAttribute('disabled');
                    labelEl.removeAttribute('style');
                    labelEl.removeAttribute('data-legend-id');
                    labelEl.className = '';

                    var date = null;
                    if (i < startDay) {
                        labelEl.childNodes[0].innerHTML = daysLast - (startDay - i - 1);
                        if (index == 0) {
                            date = new Date(year, month + index - 2, daysLast - (startDay - i - 1));
                            labelEl.className = 'prev';
                        } else {
                            date = '';
                            labelEl.className = 'd-hidden';
                            inputEl.setAttribute('disabled', true);
                        }
                    } else if (i < days + startDay) {
                        date = new Date(year, month + index - 1, i - startDay + 1);
                        labelEl.childNodes[0].innerHTML = i - startDay + 1;
                        labelEl.className = '';
                    } else {
                        labelEl.childNodes[0].innerHTML = i - days - startDay + 1;
                        if (index == monthElements.length - 1) {
                            date = new Date(year, month + index, i - days - startDay + 1);
                            labelEl.className = 'next';
                        } else {
                            date = '';
                            labelEl.className = 'd-hidden';
                            inputEl.setAttribute('disabled', true);
                        }
                    }

                    if (date instanceof Date) {
                        inputEl.setAttribute('data-date', date.toJSON());

                        if (disabledDates.indexOf(date.getTime()) != -1 || disabledDays.indexOf(date.getDay()) != -1) {
                            inputEl.setAttribute('disabled', true);
                        }

                        if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
                            inputEl.setAttribute('disabled', true);
                            labelEl.className = 'd-hidden';

                        }

                        if (today && date.getTime() == new Date().setHours(0, 0, 0, 0)) {
                            labelEl.classList.add('today');
                        } else {
                            labelEl.classList.remove('today');
                        }


                        if (tooltips[date.getTime()]) {
                            labelEl.childNodes[0].setAttribute('data-tooltip', true);
                            labelEl.childNodes[1].innerHTML = tooltips[date.getTime()];
                        } else {
                            labelEl.childNodes[0].removeAttribute('data-tooltip');
                            labelEl.childNodes[1].innerHTML = '';
                        }

                        var _highlights = highlight.filter(function (x) {
                            for (var m = 0; m < x.dates.length; m++) {
                                if (date.getTime() >= x.dates[m].start.getTime() && date.getTime() <= x.dates[m].end.getTime()) {
                                    return true;
                                }
                            }
                            return false;
                        });

                        if (_highlights.length > 0) {
                            var bgColor = '';
                            var legendIds = '';

                            if (_highlights.length > 1) {
                                var percent = Math.round(100 / _highlights.length);
                                bgColor = 'background: linear-gradient(-45deg,';
                                for (var z = 0; z < _highlights.length; z++) {
                                    legendIds += highlight.indexOf(_highlights[z]);
                                    if (z !== _highlights.length - 1) {
                                        legendIds += ' ';
                                    }
                                    bgColor += _highlights[z].backgroundColor + ' ' + (percent * z) + '%';
                                    if (z != _highlights.length - 1) {
                                        bgColor += ',';
                                        bgColor += _highlights[z].backgroundColor + ' ' + (percent * (z + 1)) + '%,';
                                    }
                                }
                                bgColor += ');';
                            } else {
                                bgColor = (_highlights[0].backgroundColor) ? 'background:' + _highlights[0].backgroundColor + ';' : '';
                                legendIds += highlight.indexOf(_highlights[0]);
                            }
                            var Color = (_highlights[0].color) ? 'color:' + _highlights[0].color + ';' : '';
                            labelEl.setAttribute('style', bgColor + Color);
                            labelEl.setAttribute('data-legend-id', legendIds);
                        }
                    }
                });
            });

            generateLegends();
        }

        function setDate() {
            if (!that.el.tables.childNodes.length || !that.el.tables.childNodes[0].childNodes.length) return;

            resetCalendar();

            if (currentMonth > 12 || currentMonth < 1) {
                if (currentMonth > 12) {
                    currentYear += 1;
                    currentMonth -= 12;
                } else {
                    currentYear -= 1;
                    currentMonth += 12;
                }
            }

            if (maxDate && new Date(currentYear, currentMonth - 1 + months - 1, 1) >= new Date(maxDate).setDate(1)) {
                currentYear = maxDate.getFullYear();
                currentMonth = maxDate.getMonth() + 1 - months + 1;
                that.el.header.childNodes[2].setAttribute('style', 'visibility:hidden');
            } else {
                that.el.header.childNodes[2].removeAttribute('style');
            }
            if (minDate && new Date(currentYear, currentMonth - 1, 1) <= new Date(minDate).setDate(1)) {
                currentYear = minDate.getFullYear();
                currentMonth = minDate.getMonth() + 1;
                that.el.header.childNodes[0].setAttribute('style', 'visibility:hidden');
            } else {
                that.el.header.childNodes[0].removeAttribute('style');
            }

            for (var c = 0; c < months; c++) {
                var index = currentMonth - 1 + c;
                if (index > 11) {
                    index -= 12;
                } else if (index < 0) {
                    index += 12;
                }

                that.el.monthPicker.childNodes[index].classList.add('current');
            }

            generateDates(currentYear, currentMonth);
            generateYears();
            var startmonth = languages[lang].monthNames[currentMonth - 1];
            var endmonth = '';
            if (months > 1) {
                endmonth += ' - ';
                var monthint = currentMonth - 1 + months - 1;
                if (monthint > 11) {
                    monthint -= 12;
                } else if (monthint < 0) {
                    monthint += 12;
                }
                endmonth += languages[lang].monthNames[monthint];
            }
            var yearname = (currentMonth - 1 + months - 1 > 11) ? currentYear.toString().substring(2, 4) + '/' + (currentYear + 1).toString().substring(2, 4) : currentYear.toString().substring(2, 4);
            that.el.header.childNodes[1].childNodes[0].innerHTML = startmonth + endmonth;
            that.el.header.childNodes[1].childNodes[1].innerHTML = yearname;

            that.el.yearPicker.querySelector('[data-year="0"]').classList.add('current');
            if (currentMonth - 1 + months - 1 > 11) {
                that.el.yearPicker.querySelector('[data-year="1"]').classList.add('current');
            }

            renderSelectedDates();
            if (onNavigation) onNavigation.call(that);
        }

        function renderSelectedDates() {
            selectedDates.forEach(function (date) {
                var el = getDayElement(date);
                if (el) {
                    el.checked = true;
                }
            });

            that.el.tables.classList.remove('before');
            if (range && selectedDates.length > 1) {
                var currentDate = new Date(currentYear, currentMonth - 1, 1);
                var sorted = selectedDates.sort(function (a, b) {
                    return a.getTime() - b.getTime()
                });
                var first = getDayElement(sorted[0]);
                if (!first && currentDate >= new Date(sorted[0].getFullYear(), sorted[0].getMonth(), 1) && currentDate <= new Date(sorted[1].getFullYear(), sorted[1].getMonth(), 1)) {
                    that.el.tables.classList.add('before');
                }
            }
        }

        function resetCalendar() {
            [].slice.call(that.el.querySelectorAll('.d-table input')).forEach(function (inputEl) {
                inputEl.checked = false;
            });

            [].slice.call(that.el.monthPicker.querySelectorAll('.current')).forEach(function (monthPickEl) {
                monthPickEl.classList.remove('current');
            });

            [].slice.call(that.el.yearPicker.querySelectorAll('.current')).forEach(function (yearPickEl) {
                yearPickEl.classList.remove('current');
            });
        }

        function nextMonth() {
            currentMonth += months;
            setDate();
        }

        function prevMonth() {
            currentMonth -= months;
            setDate();
        }

        function selectDate(date, ignoreOnSelect) {
            var _date = new Date(date);

            var el = getDayElement(_date);

            if (range && el && el.checked) {
                el.classList.add('single');
            }

            if (el && !el.checked) {
                el.checked = true;
            }


            selectedDates.push(_date);

            if (onSelect && !ignoreOnSelect) {
                onSelect.apply(_date, [true]);
            }
        }

        function unselectDate(date, ignoreOnSelect) {
            var _date = new Date(date);

            var el = getDayElement(_date);
            if (el) {
                el.classList.remove('single');
                if (el.checked) {
                    el.checked = false;
                }
            }

            selectedDates = selectedDates.filter(function (x) {
                return x.getTime() != date.getTime()
            });

            if (onSelect && !ignoreOnSelect) {
                onSelect.call(_date, false);
            }
        };

        function unselectAll(ignoreOnSelect) {
            selectedDates.forEach(function (date) {
                unselectDate(date, ignoreOnSelect);
            });
        };

        function inputChange(e) {
            var input = this;
            var date = new Date(input.getAttribute('data-date'));
            input.classList.remove('single');
            if (locked) {
                return;
            }
            if (range) {
                that.el.tables.classList.remove('before');
            }
            if (input.checked) {

                if (maxSelections && (selectedDates.length > maxSelections - 1)) {
                    unselectAll()
                }

                if (range && selectedDates.length) {
                    var first = getDayElement(selectedDates[0]);
                    if (date > selectedDates[0]) {
                        if (!first) {
                            that.el.tables.classList.add('before');
                        }
                    } else {
                        unselectAll()
                    }
                }

                selectedDates.push(date);

                if (closeOnSelect) {
                    that.hide();
                }
            } else {
                if (range && selectedDates.length == 1 && getDayString(selectedDates[0]) === getDayString(date)) {
                    selectDate(date);
                    input.classList.add('single');
                } else {
                    unselectAll();
                    input.checked = true;
                    selectedDates.push(date);
                }
            }

            if (maxSelections === 2) {
                setDateField('start', selectedDates[0] ? new Date(selectedDates[0]) : languages[lang].datePlaceholder);
                setDateField('end', selectedDates[1] ? new Date(selectedDates[1]) : languages[lang].datePlaceholder);

                setDisabledOfTimeField('start', !(selectedDates[0] && selectedDates[1]));
                setDisabledOfTimeField('end', !(selectedDates[0] && selectedDates[1]));
                setDisabledOfSelectField(!(selectedDates[0] && selectedDates[1]));
                that.el.button.disabled = !((selectedDates[0] && selectedDates[1]) && selectedAmount);
                console.log(that.el.button.disabled)

                setTime('start');
                if (!!(selectedDates[0] && selectedDates[1])) {
                    setTime('end');
                }
            }

            if (onSelect) {
                onSelect.call(date, input.checked);
            }

            console.log(selectedDates)
        }

        function timeChange(e) {
            var input = this;
            var name = input.getAttribute('data-time-field');

            var index = name === 'start' ? 0 : 1;
            selectedDates[index] = setTimeOfDateFromTimeField(selectedDates[index], input.value);

        }

        function amountChange(e) {
            console.log(this);
            selectedAmount = e.currentTarget.value;
        }

        function setDateField(name, date) {
            var field = that.el.form.querySelector('[data-date-field="' + name + '"]');
            field.innerText = date instanceof Date ? date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear() : date;
        }

        function setTime(name) {
            var input = getTimeField(name);
            var index = name === 'start' ? 0 : 1;

            selectedDates[index] = setTimeOfDateFromTimeField(selectedDates[index], input.value);
        }

        function getTimeField(name) {
            return that.el.form.querySelector('[data-time-field="' + name + '"]');
        }

        function setTimeOfDateFromTimeField(date, time) {
            time = time.split(':');
            date.setHours(time[0], time[1]);

            return date;
        }

        function getDayString(date) {
            return date.getDate() + date.getMonth() + date.getFullYear();
        }

        function getDayElement(date) {
            date.setHours(0, 0, 0, 0);
            return that.el.querySelector('[data-date="' + date.toJSON() + '"]');
        }

        function setDisabledOfTimeField(name, x) {
            var input = that.el.form.querySelector('[data-time-field="' + name + '"]');

            if (input.style.display === 'none') {
                console.log('dateFallback');
                var fallbackHourSelect = input.nextElementSibling.querySelector('[data-time-field="' + name + '-hour"]');
                var fallbackMinuteSelect = input.nextElementSibling.querySelector('[data-time-field="' + name + '-minute"]');

                fallbackHourSelect.disabled = x;
                fallbackMinuteSelect.disabled = x;
            }

            input.disabled = x;
        }

        function setDisabledOfSelectField(x) {
            var input = that.el.form.querySelector('[data-field="amount"]');
            input.disabled = x;
        }

        function setRange(val) {
            if (val) {
                range = true;
                that.el.tables.classList.add('range');
            } else {
                range = false;
                that.el.tables.classList.remove('range');
            }
        }

        function show(properties) {
            if (!that.inline && that.container === document.body) {
                document.body.classList.add('d-noscroll');
            }
            setArgs(properties);
            var handler = function () {
                that.el.classList.remove('d-show');
                that.el.calendar.removeEventListener(whichAnimationEvent(), handler);
            };
            that.el.calendar.addEventListener(whichAnimationEvent(), handler);
            that.el.classList.add('d-show');
            container.appendChild(that.el);
            opened = true;
            if (startDate) {
                currentMonth = startDate.getMonth() + 1;
                currentYear = startDate.getFullYear();
            }
            setDate();
        }

        function hide() {
            document.body.classList.remove('d-noscroll');
            var handler = function () {
                that.el.parentNode.removeChild(that.el);
                opened = false;
                that.el.classList.remove('d-hide');
                if (typeof onClose == 'function') {
                    onClose.apply(that);
                }
                that.el.removeEventListener(whichAnimationEvent(), handler);
            }
            that.el.addEventListener(whichAnimationEvent(), handler);
            that.el.classList.add('d-hide');
        }

        function bindEvents() {
            that.el.header.childNodes[0].addEventListener(eventName, prevMonth);
            that.el.header.childNodes[2].addEventListener(eventName, nextMonth);
            that.el.header.childNodes[1].childNodes[0].addEventListener(eventName, function () {
                if (that.el.monthPicker.classList.contains('d-show')) {
                    that.el.monthPicker.classList.remove('d-show');
                } else {
                    that.el.monthPicker.classList.add('d-show');
                }
                that.el.yearPicker.classList.remove('d-show');
            });
            that.el.header.childNodes[1].childNodes[1].addEventListener(eventName, function () {
                generateYears();
                if (that.el.yearPicker.classList.contains('d-show')) {
                    that.el.yearPicker.classList.remove('d-show');
                } else {
                    that.el.yearPicker.classList.add('d-show');
                }
                that.el.monthPicker.classList.remove('d-show');
            });
            that.el.button.addEventListener(eventName, hide);

            that.el.overlay.addEventListener(eventName, function () {
                if (closeOnClick) {
                    that.hide();
                }
            });

            [].slice.call(that.el.monthPicker.childNodes).forEach(function (monthPicker) {
                monthPicker.addEventListener(eventName, function () {
                    currentMonth = parseInt(this.getAttribute('data-month'));
                    setDate();
                    that.el.monthPicker.classList.remove('d-show');
                });
            });

            [].slice.call(that.el.yearPicker.childNodes).forEach(function (yearPicker) {
                yearPicker.addEventListener(eventName, function () {
                    currentYear += parseInt(this.getAttribute('data-year'));
                    setDate();
                    that.el.yearPicker.classList.remove('d-show');
                });
            });

            var startX = 0;
            var distance = 0;
            that.el.calendar.addEventListener('touchstart', function (e) {
                startX = e.changedTouches[0].clientX || e.originalEvent.changedTouches[0].clientX;
                //e.preventDefault();
            });

            that.el.calendar.addEventListener('touchmove', function (e) {
                distance = e.changedTouches[0].clientX - startX || e.originalEvent.changedTouches[0].clientX - startX;
                e.preventDefault();
            });

            that.el.calendar.addEventListener('touchend', function (e) {
                if (distance > 50) {
                    prevMonth();
                } else if (distance < -50) {
                    nextMonth();
                }
                distance = 0;
            });
        }

        function setArgs(x) {
            for (var key in x) {
                if (key in that) {
                    that[key] = x[key];
                }
            }
        }

        function init() {
            that.el = document.createElement('div');
            that.el.classList.add('ResourceCal');
            that.el.classList.add(getBrowserVersion().type);
            that.el.innerHTML = template;
            that.el.titleBox = that.el.childNodes[0];
            that.el.calendar = that.el.childNodes[1];
            that.el.header = that.el.calendar.childNodes[0];
            that.el.monthPicker = that.el.calendar.childNodes[1];
            that.el.yearPicker = that.el.calendar.childNodes[2];
            that.el.days = that.el.calendar.childNodes[3];
            that.el.tables = that.el.calendar.childNodes[4];
            that.el.legend = that.el.childNodes[2];
            that.el.form = that.el.childNodes[3];
            that.el.button = that.el.childNodes[4].childNodes[0];
            that.el.overlay = that.el.childNodes[5];

            setArgs(args);

            generateInputs();
            generateDaynames();
            generateFormFields();
            bindEvents();

            if (inline) {
                show();
            }

            if (window.FastClick != null) {
                FastClick.attach(that.el);
            }
        }

        that.show = show;
        that.hide = hide;
        that.selectDate = selectDate;
        that.unselectAll = unselectAll;
        that.unselectDate = unselectDate;

        function currentDateGetter() {
            return new Date(currentYear, currentMonth - 1, 1);
        }

        function currentDateSetter(x) {
            x = new Date(x);
            currentMonth = x.getMonth() + 1;
            currentYear = x.getFullYear();
            setDate();
        }

        Object.defineProperties(that, {
            "selectedDates": {
                get: function () {
                    return selectedDates.sort(function (a, b) {
                        return a.getTime() - b.getTime();
                    });
                }
            },
            "range": {
                get: function () {
                    return range;
                },
                set: function (x) {
                    setRange(x);
                    if (x) {
                        maxSelections = 2;
                    }
                }
            },
            "button": {
                get: function () {
                    return button;
                },
                set: function (x) {
                    if (typeof x == 'string') {
                        button = x;
                    } else {
                        button = null;
                    }
                    that.el.button.innerText = (button) ? button : '';
                }
            },
            "title": {
                get: function () {
                    return title;
                },
                set: function (x) {
                    if (typeof x == 'string') {
                        title = x;
                    } else {
                        title = null;
                    }
                    that.el.titleBox.innerText = (title) ? title : '';
                }
            },
            "lang": {
                get: function () {
                    return lang;
                },
                set: function (x) {
                    if (x in languages) {
                        lang = x;
                        generateDaynames();
                        setDate();
                    } else {
                        console.error('Language not found');
                    }
                }
            },
            "weekStart": {
                get: function () {
                    return (weekStart !== null) ? weekStart : languages[lang].weekStart;
                },
                set: function (x) {
                    if (typeof x == 'number' && x > -1 && x < 7) {
                        weekStart = x;
                        generateDaynames();
                        setDate();
                    } else {
                        console.error('weekStart must be a number between 0 and 6');
                    }
                }
            },
            "months": {
                get: function () {
                    return months;
                },
                set: function (x) {
                    if (typeof x == 'number' && x > 0) {
                        months = x;
                        generateDaynames();
                        generateInputs();
                        setDate();

                        if (months == 1) {
                            that.el.classList.remove('multi');
                        } else {
                            that.el.classList.add('multi');
                        }
                    } else {
                        console.error('months must be a number > 0');
                    }
                }
            },
            "isOpen": {
                get: function () {
                    return opened;
                }
            },
            "closeOnSelect": {
                get: function () {
                    return closeOnSelect;
                },
                set: function (x) {
                    if (x) {
                        closeOnSelect = true;
                    } else {
                        closeOnSelect = false;
                    }
                }
            },
            "disabledDays": {
                get: function () {
                    return disabledDays;
                },
                set: function (x) {
                    if (x instanceof Array) {
                        for (var i = 0; i < x.length; i++) {
                            if (typeof x[i] == 'number') {
                                disabledDays.push(x[i]);
                            }
                        }
                    } else if (typeof x == 'number') {
                        disabledDays = [x];
                    } else if (!x) {
                        disabledDays = [];
                    }
                    setDate();
                }
            },
            "disabledDates": {
                get: function () {
                    return disabledDates.map(function (x) {
                        return new Date(x);
                    });
                },
                set: function (x) {
                    if (x instanceof Array) {
                        x.forEach(function (date) {
                            if (date instanceof Date) {
                                disabledDates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
                            }
                        });
                    } else if (x instanceof Date) {
                        disabledDates = [new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()];
                    } else if (!x) {
                        disabledDates = [];
                    }
                    setDate();
                }
            },
            "highlight": {
                get: function () {
                    return highlight;
                },
                set: function (x) {
                    if (x instanceof Array) {
                        x.forEach(function (hl) {
                            if (hl instanceof Object) {
                                var highlightObj = {};
                                highlightObj.dates = [];

                                if ('start' in hl) {
                                    highlightObj.dates.push({
                                        start: new Date(hl.start.getFullYear(), hl.start.getMonth(), hl.start.getDate()),
                                        end: ('end' in hl) ? new Date(hl.end.getFullYear(), hl.end.getMonth(), hl.end.getDate()) : new Date(hl.start.getFullYear(), hl.start.getMonth(), hl.start.getDate())
                                    });
                                } else if ('dates' in hl && hl.dates instanceof Array) {
                                    hl.dates.forEach(function (hlDate) {
                                        highlightObj.dates.push({
                                            start: new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate()),
                                            end: ('end' in hlDate) ? new Date(hlDate.end.getFullYear(), hlDate.end.getMonth(), hlDate.end.getDate()) : new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate())
                                        });
                                    })
                                }

                                highlightObj.color = hl.color;
                                highlightObj.backgroundColor = hl.backgroundColor;
                                highlightObj.legend = ('legend' in hl) ? hl.legend : null;

                                highlight.push(highlightObj);
                            }
                        });
                    } else if (x instanceof Object) {
                        var highlightObj = {};
                        highlightObj.dates = [];

                        if ('start' in x) {
                            highlightObj.dates.push({
                                start: new Date(x.start.getFullYear(), x.start.getMonth(), x.start.getDate()),
                                end: ('end' in x) ? new Date(x.end.getFullYear(), x.end.getMonth(), x.end.getDate()) : new Date(x.start.getFullYear(), x.start.getMonth(), x.start.getDate())
                            });
                        } else if ('dates' in x && x.dates instanceof Array) {
                            x.dates.forEach(function (hlDate) {
                                highlightObj.dates.push({
                                    start: new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate()),
                                    end: ('end' in hlDate) ? new Date(hlDate.end.getFullYear(), hlDate.end.getMonth(), hlDate.end.getDate()) : new Date(hlDate.start.getFullYear(), hlDate.start.getMonth(), hlDate.start.getDate())
                                });
                            });
                        }

                        highlightObj.color = x.color;
                        highlightObj.backgroundColor = x.backgroundColor;
                        highlightObj.legend = ('legend' in x) ? x.legend : null;

                        highlight.push(highlightObj);
                    } else if (!x) {
                        highlight = [];
                    }

                    setDate();
                }
            },
            "onClose": {
                set: function (callback) {
                    onClose = callback;
                }
            },
            "onSelect": {
                set: function (callback) {
                    onSelect = callback;
                }
            },
            "today": {
                get: function () {
                    return today;
                },
                set: function (x) {
                    if (x) {
                        today = true;
                    } else {
                        today = false;
                    }
                }
            },
            "daynames": {
                get: function () {
                    return daynames;
                },
                set: function (x) {
                    if (x) {
                        daynames = true;
                    } else {
                        daynames = false;
                    }
                    generateDaynames();
                }
            },
            "fullscreen": {
                get: function () {
                    return that.el.classList.contains('fullscreen');
                },
                set: function (x) {
                    if (x) {
                        that.el.classList.add('fullscreen');
                    } else {
                        that.el.classList.remove('fullscreen');
                    }
                }
            },
            "locked": {
                get: function () {
                    return locked;
                },
                set: function (x) {
                    if (x) {
                        locked = true;
                        that.el.tables.classList.add('locked');
                    } else {
                        locked = false;
                        that.el.tables.classList.remove('locked');
                    }
                }
            },
            "maxSelections": {
                get: function () {
                    return maxSelections;
                },
                set: function (x) {
                    if (typeof x == 'number' && !range) {
                        maxSelections = x;
                    } else {
                        if (range) {
                            maxSelections = 2;
                        } else {
                            maxSelections = null;
                        }
                    }
                }
            },
            "onConfirm": {
                set: function (callback) {
                    if (typeof callback == 'function') {
                        onConfirm = callback.bind(that);
                        that.el.button.addEventListener(eventName, onConfirm);
                    } else if (!callback) {
                        that.el.button.removeEventListener(eventName, onConfirm);
                        onConfirm = null;
                    }
                }
            },
            "onNavigation": {
                set: function (callback) {
                    if (typeof callback == 'function') {
                        onNavigation = callback.bind(that);
                    } else if (!callback) {
                        onNavigation = null;
                    }
                }
            },
            "closeOnClick": {
                get: function () {
                    return closeOnClick;
                },
                set: function (x) {
                    if (x) {
                        closeOnClick = true;
                    } else {
                        closeOnClick = false;
                    }
                }
            },
            "tooltips": {
                get: function () {
                    var ret = [];
                    for (key in tooltips) {
                        ret.push({
                            date: new Date(parseInt(key)),
                            text: tooltips[key]
                        });
                    }
                    return ret;
                },
                set: function (x) {
                    if (x instanceof Array) {
                        x.forEach(function (item) {
                            if (item.date && item.text && item.date instanceof Date) {
                                tooltips[new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate()).getTime()] = item.text;
                            }
                        });
                    } else if (x instanceof Object) {
                        if (x.date && x.text && x.date instanceof Date) {
                            tooltips[new Date(x.date.getFullYear(), x.date.getMonth(), x.date.getDate()).getTime()] = x.text;
                        }
                    } else if (!x) {
                        tooltips = [];
                    }
                    setDate();
                }
            },
            "currentDate": {
                get: currentDateGetter,
                set: currentDateSetter
            },
            "setDate": {
                set: currentDateSetter
            },
            "startDate": {
                get: function () {
                    return startDate;
                },
                set: function (x) {
                    if (x) {
                        startDate = new Date(x);
                    } else {
                        startDate = null;
                        currentYear = new Date().getFullYear();
                        currentMonth = new Date().getMonth() + 1;
                    }
                    setDate();
                }
            },
            "minDate": {
                get: function () {
                    return minDate;
                },
                set: function (x) {
                    minDate = (x) ? new Date(x) : null;
                    setDate();
                }
            },
            "maxDate": {
                get: function () {
                    return maxDate;
                },
                set: function (x) {
                    maxDate = (x) ? new Date(x) : null;
                    setDate();
                }
            },
            "container": {
                get: function () {
                    return container;
                },
                set: function (x) {
                    if (x instanceof String) {
                        var y = document.querySelector(x);
                        if (y) {
                            container = y;
                            if (container != document.body) {
                                that.el.classList.add('wrapped');
                            } else {
                                that.el.classList.remove('wrapped');
                            }
                        } else {
                            console.error("Container doesn't exist");
                        }
                    } else if (x instanceof HTMLElement) {
                        container = x;
                        if (container != document.body) {
                            that.el.classList.add('wrapped');
                        } else {
                            that.el.classList.remove('wrapped');
                        }
                    } else {
                        console.error("Invalid type");
                    }
                }
            },
            "inline": {
                get: function () {
                    return inline;
                },
                set: function (x) {
                    if (x) {
                        inline = true;
                        that.el.classList.add('inline');
                    } else {
                        inline = false;
                        that.el.classList.remove('inline');
                    }
                }
            },


        });

        init();
        setDate();

        return Object.freeze(that);
    }

    function whichAnimationEvent() {
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'animation': 'animationend',
            'OAnimation': 'oanimationend',
            'MozAnimation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd',
            '': 'MSAnimationEnd'
        };

        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }

    var template = '<div class="d-title"></div>' +
        '<div class="d-calendar">' +
        '<div class="d-header">' +
        '<i id="d-previous"></i>' +
        '<p><span class="d-month"></span><span class="d-year"></span></p>' +
        '<i id="d-next"></i>' +
        '</div>' +
        '<div class="d-month-picker">' +
        '<div data-month="1">1</div>' +
        '<div data-month="2">2</div>' +
        '<div data-month="3">3</div>' +
        '<div data-month="4">4</div>' +
        '<div data-month="5">5</div>' +
        '<div data-month="6">6</div>' +
        '<div data-month="7">7</div>' +
        '<div data-month="8">8</div>' +
        '<div data-month="9">9</div>' +
        '<div data-month="10">10</div>' +
        '<div data-month="11">11</div>' +
        '<div data-month="12">12</div>' +
        '</div>' +
        '<div class="d-year-picker">' +
        '<div data-year="-5"></div>' +
        '<div data-year="-4"></div>' +
        '<div data-year="-3"></div>' +
        '<div data-year="-2"></div>' +
        '<div data-year="-1"></div>' +
        '<div data-year="0"></div>' +
        '<div data-year="1"></div>' +
        '<div data-year="2"></div>' +
        '<div data-year="3"></div>' +
        '<div data-year="4"></div>' +
        '<div data-year="5"></div>' +
        '</div>' +
        '<div class="d-weekdays"></div>' +
        '<div class="d-tables"></div>' +
        '</div>' +
        '<div class="d-legend"></div>' +
        '<div class="d-form"></div>' +
        '<div class="d-confirm">' +
        '<button class="d-confirm-button"></button>' +
        '</div>' +
        '<div class="d-overlay"></div>';

    var getBrowserVersion = function () {
        var browser = {
            type: null,
            version: null
        };

        var ua = navigator.userAgent, tem, ios,
            M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        ios = ua.match(/(iphone|ipad)\s+OS\s+([\d+_]+\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            browser.type = 'MSIE';
            browser.version = parseInt(tem[1]);
            return browser;
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/)
            if (tem != null) return 'Opera ' + tem[1];
        }
        if (ios[1]) {
            return browser = {
                type: 'iOS',
                version: ios[2]
            };
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        browser.type = M[0];
        browser.version = parseInt(M[1]);

        return browser;
    };

    /* Spread it to the world! */
    if (typeof define === 'function' && define.amd) define('ResourceCal', ResourceCal);
    else if (typeof exports === 'object') module.exports = ResourceCal;
    else window.ResourceCal = ResourceCal;
})();
