var mongoose = require('mongoose');

var DailyViewSchema = new mongoose.Schema({
    AggregateId: { 'type': Number},
    AggregateName: { 'type': String },
    ReportName: { 'type': String },
    IsPercentage: { 'type': Boolean },
    NumGroupingColumns: { 'type': Number },
    GroupingValue: { 'type': String },
    SubGroupingValue: { 'type': String },
    MetricValue: { 'type': Number },
    YearName: { 'type': String },
    MonthName: { 'type': String },
    DayOfMonth: { 'type': String },
    DateParts: { 'type': Number },
    Instance: { 'type': String },
    inTime: { 'type': Date }
  });

var WeeklyViewSchema = new mongoose.Schema({
    AggregateId: { 'type': Number},
    AggregateName: { 'type': String },
    ReportName: { 'type': String },
    IsPercentage: { 'type': Boolean },
    NumGroupingColumns: { 'type': Number },
    GroupingValue: { 'type': String },
    SubGroupingValue: { 'type': String },
    MetricValue: { 'type': Number },
    YearName: { 'type': String },
    MonthName: { 'type': String },
    LastDayOfWeek: { 'type': String },
    DateParts: { 'type': Number },
    Instance: { 'type': String },
    inTime: { 'type': Date }
  });

var MonthlyViewSchema = new mongoose.Schema({
    AggregateId: { 'type': Number},
    AggregateName: { 'type': String },
    ReportName: { 'type': String },
    IsPercentage: { 'type': Boolean },
    NumGroupingColumns: { 'type': Number },
    GroupingValue: { 'type': String },
    SubGroupingValue: { 'type': String },
    MetricValue: { 'type': Number },
    YearName: { 'type': String },
    MonthName: { 'type': String },
    DateParts: { 'type': Number },
    Instance: { 'type': String },
    inTime: { 'type': Date }
  });

var QuarterlyViewSchema = new mongoose.Schema({
    AggregateId: { 'type': Number},
    AggregateName: { 'type': String },
    ReportName: { 'type': String },
    IsPercentage: { 'type': Boolean },
    NumGroupingColumns: { 'type': Number },
    GroupingValue: { 'type': String },
    SubGroupingValue: { 'type': String },
    MetricValue: { 'type': Number },
    YearName: { 'type': String },
    QuarterName: { 'type': String },
    DateParts: { 'type': Number },
    Instance: { 'type': String },
    inTime: { 'type': Date }
  });

var YearlyViewSchema = new mongoose.Schema({
    AggregateId: { 'type': Number},
    AggregateName: { 'type': String },
    ReportName: { 'type': String },
    IsPercentage: { 'type': Boolean },
    NumGroupingColumns: { 'type': Number },
    GroupingValue: { 'type': String },
    SubGroupingValue: { 'type': String },
    MetricValue: { 'type': Number },
    YearName: { 'type': String },
    DateParts: { 'type': Number },
    Instance: { 'type': String },
    inTime: { 'type': Date }
  });

module.exports = function(){
  mongoose.model('MetricAggregatesDailyView', DailyViewSchema);
  mongoose.model('MetricAggregatesWeeklyView', WeeklyViewSchema);
  mongoose.model('MetricAggregatesMonthlyView', MonthlyViewSchema);
  mongoose.model('MetricAggregatesQuarterlyView', QuarterlyViewSchema);
  mongoose.model('MetricAggregatesYearlyView', YearlyViewSchema);
}