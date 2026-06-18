# Color System

Background:
#F8FAFC

Surface:
#FFFFFF

Border:
#E5E7EB

Primary:
#2563EB

Success:
#16A34A

Warning:
#F59E0B

Error:
#DC2626

Text Primary:
#111827

Text Secondary:
#6B7280

Avoid tinted page backgrounds.

Avoid colored cards unless representing status.

---

# Typography

Font Family:
DM Sans

Page Title:
28px / 700

Section Title:
20px / 600

Card Title:
14px / 600

Body:
14px / 400

Caption:
12px / 400

Tables:
13px

Typography should prioritize readability over aesthetics.

---

# Cards

Cards should be compact.

Use borders instead of heavy shadows.

Card Style:

* White background
* 1px border
* Border radius 12px
* Minimal shadow


# KPI Cards

KPI cards should display:

* Metric Name
* Current Value
* Trend Indicator
* Comparison Period

Example:

AT&C Loss

12.4%

↓ 1.2% vs Last Month

Keep KPI cards compact.

Target height:
100–120px

---

# Charts

Charts are the primary content element.

Use:

* Line Charts
* Bar Charts
* Area Charts
* Stacked Bars
* Donut Charts
* Heatmaps
* Tables

Avoid decorative visualizations.

Every chart should answer a business question.

Every chart should include:

* Title
* Time Context
* Tooltip
* Legend

---

# Tables

Tables are first-class components.

Requirements:

* Sorting
* Search
* Pagination
* Export
* Sticky Headers

Most analytical sections should include both:

Chart

and

Detailed Table

---

# Data Representation

Always use realistic electricity utility terminology.

Examples:

* AT&C Loss
* Billing Efficiency
* Collection Efficiency
* Energy Input
* Energy Sold
* Peak Demand
* Smart Meter Coverage
* Revenue Collection
* Outstanding Dues
* SAIFI
* SAIDI
* Distribution Transformer
* Feeder

Avoid generic placeholder business metrics.

---

# Mock Data

Generate realistic mock data.

Use believable utility values.

All mock data must support:

* Year Filtering
* Month Filtering
* Division Filtering

Data should change when filters change.

Do not hardcode static values.

---

# User Experience Guidelines

Focus on:

* Fast scanning
* Operational monitoring
* Monthly review meetings
* Department performance tracking

Users should be able to identify:

* Trends
* Exceptions
* Underperforming divisions
* Operational risks

within seconds.

---

# Development Rules

Create reusable components.

Avoid duplicate chart implementations.

Create:

* KPI Card Component
* Filter Bar Component
* Chart Container Component
* Section Header Component
* DataGrid Wrapper Component

Maintain consistency across all modules.

All pages must follow the same layout structure.
