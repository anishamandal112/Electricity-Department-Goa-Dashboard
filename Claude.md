
# CLAUDE.md

## Project Overview

A modern Executive Analytics Dashboard for the Goa Electricity Department (GED).

This is an enterprise-grade government analytics platform that consolidates operational, consumer, metering, financial, and infrastructure performance data into a single decision-support system.

The dashboard is intended for:

* Secretary (Power)
* Chief Engineer
* Superintending Engineers
* Executive Engineers
* Department Administrators
* Senior Decision Makers

The system is focused on analytics, monitoring, reporting, and performance management.

This is NOT a consumer-facing application.

This is NOT a workflow management tool.

This is NOT a CRM.

The primary goal is to provide a single source of truth for department performance.

---

# Design Philosophy

Visual style should be heavily inspired by:

* Apache Superset
* Grafana
* Power BI
* Enterprise Government MIS Systems

Prioritize:

* Information density
* Readability
* Analytical workflows
* Fast decision-making
* Trustworthy government aesthetic

---

# Application Structure

Navigation should use a collapsible left sidebar.

Primary Modules:

1. Overview
2. Consumer Services & Grievances
3. Meter Management
4. Distribution Operations
5. Revenue & Billing
6. Procurement & Finance
7. Infrastructure & Assets

Each module should feel like a dedicated analytics workspace.

---

# Layout Principles

Use a 12-column dashboard grid.

Desktop-first design.

Standard page structure:

Page Header

Global Filter Bar

KPI Section

Analytics Section

Detailed Tables

Insights / Exceptions

Every page must display meaningful information above the fold.

---

# Global Filters

Every module must support:

* Financial Year
* Month
* Circle
* Division
* Subdivision

Filters should remain visually consistent across all pages.

Position filters directly below the page title.