import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateSettingsSchema: z.ZodObject<{
    sprintDurationWeeks: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
    dailyCheckinEnabled: z.ZodOptional<z.ZodBoolean>;
    dailyCheckinTime: z.ZodOptional<z.ZodString>;
    retrospectiveEnabled: z.ZodOptional<z.ZodBoolean>;
    aiCoachName: z.ZodOptional<z.ZodString>;
    dailyFocusTaskId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createProjectSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    colorTheme: z.ZodOptional<z.ZodString>;
    targetCompletionDate: z.ZodString;
    totalSprints: z.ZodNumber;
    sprintDurationWeeks: z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>;
    teamMembers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<{
            leader: "leader";
            developer: "developer";
            member: "member";
        }>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        paused: "paused";
        completed: "completed";
    }>>;
    colorTheme: z.ZodOptional<z.ZodString>;
    targetCompletionDate: z.ZodOptional<z.ZodString>;
    totalSprints: z.ZodOptional<z.ZodNumber>;
    sprintDurationWeeks: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<1>, z.ZodLiteral<2>]>>;
}, z.core.$strip>;
export declare const createSprintSchema: z.ZodObject<{
    goal: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateSprintSchema: z.ZodObject<{
    goal: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        active: "active";
        completed: "completed";
        planning: "planning";
    }>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    velocityPoints: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const completeSprintSchema: z.ZodObject<{
    retrospective: z.ZodObject<{
        good: z.ZodString;
        improve: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    storyPoints: z.ZodOptional<z.ZodNumber>;
    assigneeId: z.ZodOptional<z.ZodString>;
    plannedDate: z.ZodOptional<z.ZodString>;
    isAiAssisted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateTaskSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        review: "review";
        done: "done";
    }>>;
    storyPoints: z.ZodOptional<z.ZodNumber>;
    assigneeId: z.ZodOptional<z.ZodString>;
    plannedDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createSubtaskSchema: z.ZodObject<{
    title: z.ZodString;
    assigneeId: z.ZodOptional<z.ZodString>;
    isAiAssisted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const aiTaskSuggestionsSchema: z.ZodObject<{
    projectId: z.ZodString;
    sprintId: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const aiChatSchema: z.ZodObject<{
    message: z.ZodString;
    projectId: z.ZodString;
    sprintId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const aiSubtaskSuggestionsSchema: z.ZodObject<{
    taskId: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const aiRetrospectiveSchema: z.ZodObject<{
    sprintId: z.ZodString;
}, z.core.$strip>;
export declare const aiEducationalContentSchema: z.ZodObject<{
    topic: z.ZodString;
    level: z.ZodOptional<z.ZodEnum<{
        beginner: "beginner";
        intermediate: "intermediate";
        advanced: "advanced";
    }>>;
}, z.core.$strip>;
export declare const subscriptionUpgradeSchema: z.ZodObject<{
    tier: z.ZodEnum<{
        pro: "pro";
        enterprise: "enterprise";
    }>;
    billingCycle: z.ZodEnum<{
        monthly: "monthly";
        yearly: "yearly";
    }>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const paymentMethodSchema: z.ZodObject<{
    cardNumber: z.ZodString;
    expiryDate: z.ZodString;
    cvc: z.ZodString;
    cardHolder: z.ZodString;
}, z.core.$strip>;
export declare const uuidSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const validateDateRange: (startDate: string, endDate: string) => boolean;
//# sourceMappingURL=validation.d.ts.map