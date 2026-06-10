"use client";

import type { ComponentProps, FC, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "../../libs";
import type { ProgramDetailNew } from ".";
import type { NavigationTarget } from "./use-program-plan-selection";

type Day = ComponentProps<typeof ProgramDetailNew>["days"][number];

type Props = {
	days: Day[];
	target: NavigationTarget | undefined;
	children: ReactNode;
};

export const DrilldownTransition: FC<Props> = ({ days, target, children }) => {
	const previousTargetRef = useRef<NavigationTarget | undefined>(target);
	const previousTarget = previousTargetRef.current;
	const animationClass = getTransitionClass(days, previousTarget, target);
	previousTargetRef.current = target;

	return (
		<div
			key={formatTargetKey(target)}
			className={cn("duration-200 motion-safe:animate-in", animationClass)}
		>
			{children}
		</div>
	);
};

const getTransitionClass = (
	days: Day[],
	previousTarget: NavigationTarget | undefined,
	nextTarget: NavigationTarget | undefined,
): string => {
	if (previousTarget === undefined || nextTarget === undefined) {
		return "fade-in";
	}

	const previousDepth = getTargetDepth(previousTarget);
	const nextDepth = getTargetDepth(nextTarget);
	if (nextDepth > previousDepth) {
		return "fade-in slide-in-from-right-4";
	}
	if (nextDepth < previousDepth) {
		return "fade-in slide-in-from-left-4";
	}

	const siblingDelta =
		getSiblingIndex(days, nextTarget) - getSiblingIndex(days, previousTarget);
	if (siblingDelta > 0) {
		return "fade-in slide-in-from-top-4";
	}
	if (siblingDelta < 0) {
		return "fade-in slide-in-from-bottom-4";
	}
	return "fade-in";
};

const getTargetDepth = (target: NavigationTarget): number => {
	switch (target.level) {
		case "root":
			return 0;
		case "day":
			return 1;
		case "exercise":
			return 2;
	}
};

const getSiblingIndex = (days: Day[], target: NavigationTarget): number => {
	switch (target.level) {
		case "root":
			return 0;
		case "day":
			return days.findIndex((day) => day.id === target.dayId);
		case "exercise": {
			const day = days.find((day) => day.id === target.dayId);
			return (
				day?.exercisePlans.findIndex(
					(exercisePlan) => exercisePlan.id === target.exercisePlanId,
				) ?? -1
			);
		}
	}
};

const formatTargetKey = (target: NavigationTarget | undefined): string => {
	if (target === undefined) {
		return "root";
	}
	switch (target.level) {
		case "root":
			return "root";
		case "day":
			return `day:${target.dayId}`;
		case "exercise":
			return `exercise:${target.dayId}:${target.exercisePlanId}`;
	}
};
