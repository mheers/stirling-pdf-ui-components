import type { Component } from 'vue';

export interface TabItem {
  value: string;
  label: string;
  icon?: Component;
  badge?: string | number;
  disabled?: boolean;
}

export interface SegmentItem {
  value: string;
  label?: string;
  icon?: Component;
  disabled?: boolean;
  title?: string;
}

export interface RadioItem {
  value: string;
  label: string;
  description?: string;
  icon?: Component;
  disabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
