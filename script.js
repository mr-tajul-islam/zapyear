(function () {
  "use strict";

  var state = {
    renderedYear: null,
    lastDateKey: "",
    updateTimer: null,
    settings: {
      accentColor: "#f85149",
      showMotivation: true,
      enablePulse: true,
      gridSquareSize: 1,
      backgroundBrightness: 1
    }
  };

  var elements = {
    root: document.documentElement,
    body: document.body,
    year: document.getElementById("yearLabel"),
    fullDate: document.getElementById("fullDate"),
    daysPassed: document.getElementById("daysPassed"),
    daysRemaining: document.getElementById("daysRemaining"),
    completedPercent: document.getElementById("completedPercent"),
    remainingPercent: document.getElementById("remainingPercent"),
    todayRemainingPercent: document.getElementById("todayRemainingPercent"),
    todayCompletedPercent: document.getElementById("todayCompletedPercent"),
    todayProgressTrack: document.getElementById("todayProgressTrack"),
    todayProgressFill: document.getElementById("todayProgressFill"),
    todayRemainingTime: document.getElementById("todayRemainingTime"),
    calendarGrid: document.getElementById("calendarGrid"),
    progressFill: document.getElementById("progressFill"),
    motivation: document.getElementById("motivation")
  };

  function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function getDaysInYear(year) {
    return isLeapYear(year) ? 366 : 365;
  }

  function addDays(date, days) {
    var next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function getDateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function getYearProgress(now) {
    var today = startOfLocalDay(now);
    var year = today.getFullYear();
    var firstDay = new Date(year, 0, 1);
    var daysInYear = getDaysInYear(year);
    var dayIndex = Math.floor((today - firstDay) / 86400000);
    var daysPassed = Math.min(Math.max(dayIndex + 1, 1), daysInYear);
    var daysRemaining = Math.max(daysInYear - daysPassed, 0);

    return {
      today: today,
      year: year,
      firstDay: firstDay,
      daysInYear: daysInYear,
      dayIndex: dayIndex,
      daysPassed: daysPassed,
      daysRemaining: daysRemaining,
      dateKey: getDateKey(today)
    };
  }

  function formatFullDate(date) {
    var options = {
      weekday: "long",
      month: "long",
      day: "numeric"
    };

    try {
      return new Intl.DateTimeFormat("en-US", options).format(date);
    } catch (error) {
      var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];

      return weekdays[date.getDay()] + ", " + months[date.getMonth()] + " " + date.getDate();
    }
  }

  function getProgressPercentages(progress) {
    var completed = progress.daysPassed / progress.daysInYear * 100;
    var completedRounded = Math.round(completed * 10) / 10;
    var remainingRounded = Math.round((100 - completedRounded) * 10) / 10;

    return {
      completed: completedRounded.toFixed(1),
      remaining: remainingRounded.toFixed(1),
      width: completed.toFixed(4)
    };
  }

  function getDurationParts(milliseconds) {
    var totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor(totalSeconds % 3600 / 60),
      seconds: totalSeconds % 60
    };
  }

  function getTodayProgress(currentDate) {
    var startOfToday = startOfLocalDay(currentDate);
    var startOfTomorrow = addDays(startOfToday, 1);
    var totalDuration = startOfTomorrow - startOfToday;
    var timeElapsed = Math.min(Math.max(currentDate - startOfToday, 0), totalDuration);
    var timeRemaining = Math.max(startOfTomorrow - currentDate, 0);
    var completedPercentage = totalDuration > 0 ? timeElapsed / totalDuration * 100 : 100;
    var remainingPercentage = Math.max(0, 100 - completedPercentage);
    var elapsedParts = getDurationParts(timeElapsed);
    var remainingParts = getDurationParts(timeRemaining);

    return {
      completedPercentage: Math.min(Math.max(completedPercentage, 0), 100),
      remainingPercentage: Math.min(Math.max(remainingPercentage, 0), 100),
      elapsedHours: elapsedParts.hours,
      elapsedMinutes: elapsedParts.minutes,
      elapsedSeconds: elapsedParts.seconds,
      remainingHours: remainingParts.hours,
      remainingMinutes: remainingParts.minutes,
      remainingSeconds: remainingParts.seconds
    };
  }

  function formatDuration(hours, minutes, seconds) {
    return [
      String(hours).padStart(2, "0") + "h",
      String(minutes).padStart(2, "0") + "m",
      String(seconds).padStart(2, "0") + "s"
    ].join(" ");
  }

  function formatSquareDate(date) {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(date);
    } catch (error) {
      return date.toDateString();
    }
  }

  function clearChildren(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createEmptySquare() {
    var square = document.createElement("span");
    square.className = "day empty";
    square.setAttribute("aria-hidden", "true");
    return square;
  }

  function createDaySquare(date, index, progress) {
    var square = document.createElement("span");
    var squareDateKey = getDateKey(date);
    var label = formatSquareDate(date);

    square.className = "day";
    square.dataset.date = squareDateKey;
    square.title = label;
    square.setAttribute("role", "gridcell");
    square.setAttribute("aria-label", label);

    if (index < progress.dayIndex) {
      square.classList.add("past");
    } else if (index === progress.dayIndex) {
      square.classList.add("current");
      square.setAttribute("aria-current", "date");
    } else {
      square.classList.add("future");
    }

    return square;
  }

  function buildCalendar(progress) {
    var fragment = document.createDocumentFragment();
    var leadingEmptySquares = progress.firstDay.getDay();
    var totalSlots = leadingEmptySquares + progress.daysInYear;
    var trailingEmptySquares = (7 - (totalSlots % 7)) % 7;
    var weekCount = Math.ceil((totalSlots + trailingEmptySquares) / 7);

    clearChildren(elements.calendarGrid);

    for (var emptyIndex = 0; emptyIndex < leadingEmptySquares; emptyIndex += 1) {
      fragment.appendChild(createEmptySquare());
    }

    for (var dayIndex = 0; dayIndex < progress.daysInYear; dayIndex += 1) {
      fragment.appendChild(createDaySquare(addDays(progress.firstDay, dayIndex), dayIndex, progress));
    }

    for (var trailIndex = 0; trailIndex < trailingEmptySquares; trailIndex += 1) {
      fragment.appendChild(createEmptySquare());
    }

    elements.calendarGrid.style.gridTemplateColumns = "repeat(" + weekCount + ", var(--square-size))";
    elements.calendarGrid.appendChild(fragment);
    state.renderedYear = progress.year;
  }

  function refreshCalendarStates(progress) {
    var squares = elements.calendarGrid.querySelectorAll(".day[data-date]");

    squares.forEach(function (square, index) {
      square.classList.remove("past", "current", "future");
      square.removeAttribute("aria-current");

      if (index < progress.dayIndex) {
        square.classList.add("past");
      } else if (index === progress.dayIndex) {
        square.classList.add("current");
        square.setAttribute("aria-current", "date");
      } else {
        square.classList.add("future");
      }
    });
  }

  function validateProgress(progress) {
    return progress.daysPassed + progress.daysRemaining === progress.daysInYear &&
      progress.dayIndex >= 0 &&
      progress.dayIndex < progress.daysInYear;
  }

  function renderTodayProgress(now) {
    var progress = getTodayProgress(now);
    var completed = progress.completedPercentage.toFixed(1);
    var remaining = progress.remainingPercentage.toFixed(1);
    var remainingTime = formatDuration(
      progress.remainingHours,
      progress.remainingMinutes,
      progress.remainingSeconds
    );

    elements.todayRemainingPercent.textContent = "Remaining: " + remaining + "%";
    elements.todayCompletedPercent.textContent = "Completed: " + completed + "%";
    elements.todayProgressFill.style.width = progress.completedPercentage.toFixed(4) + "%";
    elements.todayProgressTrack.setAttribute("aria-valuenow", completed);
    elements.todayProgressTrack.setAttribute(
      "aria-valuetext",
      completed + "% completed, " + remaining + "% remaining"
    );
    elements.todayRemainingTime.textContent = remainingTime + " remaining";
  }

  function render() {
    var now = new Date();
    var progress = getYearProgress(now);

    if (!validateProgress(progress)) {
      progress = getYearProgress(startOfLocalDay(new Date()));
    }

    if (state.renderedYear !== progress.year || !elements.calendarGrid.children.length) {
      buildCalendar(progress);
    } else if (state.lastDateKey !== progress.dateKey) {
      refreshCalendarStates(progress);
    }

    var percentages = getProgressPercentages(progress);

    elements.year.textContent = String(progress.year);
    elements.fullDate.textContent = formatFullDate(now);
    elements.daysPassed.textContent = String(progress.daysPassed);
    elements.daysRemaining.textContent = String(progress.daysRemaining);
    elements.completedPercent.textContent = percentages.completed + "% completed";
    elements.remainingPercent.textContent = percentages.remaining + "% remaining";
    elements.progressFill.style.width = percentages.width + "%";
    renderTodayProgress(now);
    state.lastDateKey = progress.dateKey;
  }

  function normalizeBoolean(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }

    return fallback;
  }

  function normalizeNumber(value, fallback, min, max) {
    var number = Number(value);

    if (!Number.isFinite(number)) {
      return fallback;
    }

    return Math.min(Math.max(number, min), max);
  }

  function normalizeColor(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    var trimmed = value.trim();
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed) ? trimmed : fallback;
  }

  function applySettings() {
    var brightness = state.settings.backgroundBrightness;
    var backgroundRgb = [
      Math.round(5 * brightness),
      Math.round(7 * brightness),
      Math.round(10 * brightness)
    ].join(" ");

    elements.root.style.setProperty("--accent", state.settings.accentColor);
    elements.root.style.setProperty("--square-size-setting", String(state.settings.gridSquareSize));
    elements.root.style.setProperty("--bg-rgb", backgroundRgb);
    elements.motivation.classList.toggle("is-hidden", !state.settings.showMotivation);
    elements.body.classList.toggle("pulse-disabled", !state.settings.enablePulse);
  }

  function applyLivelyProperty(name, value) {
    switch (name) {
      case "accentColor":
        state.settings.accentColor = normalizeColor(value, state.settings.accentColor);
        break;
      case "showMotivation":
        state.settings.showMotivation = normalizeBoolean(value, state.settings.showMotivation);
        break;
      case "enablePulse":
        state.settings.enablePulse = normalizeBoolean(value, state.settings.enablePulse);
        break;
      case "gridSquareSize":
        state.settings.gridSquareSize = normalizeNumber(value, state.settings.gridSquareSize, 0.65, 1.45);
        break;
      case "backgroundBrightness":
        state.settings.backgroundBrightness = normalizeNumber(value, state.settings.backgroundBrightness, 0.55, 1.35);
        break;
      default:
        return;
    }

    applySettings();
    render();
  }

  window.livelyPropertyListener = function (name, value) {
    applyLivelyProperty(name, value);
  };

  window.livelyPropertiesListener = function (properties) {
    if (!properties || typeof properties !== "object") {
      return;
    }

    Object.keys(properties).forEach(function (name) {
      var property = properties[name];
      var value = property && Object.prototype.hasOwnProperty.call(property, "value") ? property.value : property;
      applyLivelyProperty(name, value);
    });
  };

  function startClock() {
    if (state.updateTimer) {
      window.clearInterval(state.updateTimer);
    }

    render();
    state.updateTimer = window.setInterval(render, 1000);
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      render();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (state.updateTimer) {
      window.clearInterval(state.updateTimer);
      state.updateTimer = null;
    }
  });

  applySettings();
  startClock();
}());
