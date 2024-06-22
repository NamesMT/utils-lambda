import type {
  ALBEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  AmplifyGraphQlResolverEvent,
  CloudWatchAlarmEvent,
  CodeCommitTriggerEvent,
  CodePipelineCloudWatchEvent,
  ConnectContactFlowEvent,
  CreateAuthChallengeTriggerEvent,
  CustomEmailSenderTriggerEvent,
  CustomMessageTriggerEvent,
  CustomSMSSenderTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  DynamoDBStreamEvent,
  EventBridgeEvent,
  KinesisStreamEvent,
  MSKEvent,
  PostAuthenticationTriggerEvent,
  PostConfirmationTriggerEvent,
  PreAuthenticationTriggerEvent,
  PreSignUpTriggerEvent,
  PreTokenGenerationTriggerEvent,
  PreTokenGenerationV2TriggerEvent,
  S3Event,
  S3NotificationEvent,
  SESEvent,
  SNSEvent,
  SQSEvent,
  SelfManagedKafkaEvent,
  UserMigrationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda'

import type { ValueOf } from 'type-fest'

/**
 * An standard event that Lambda can receive
 */
export type LambdaEvent = LambdaRequestEvent | LambdaTriggerEvent

/**
 * Union of events that are request-based
 */
export type LambdaRequestEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent

/**
 * Union of events that are internal trigger-based
 */
export type LambdaTriggerEvent = ValueOf<CommonTriggerEventsMap>

/**
 * A map for the union of trigger events that uses a common interface with identifier key, keyed by the path to the identifier key
 */
export interface CommonTriggerEventsMap {
  'eventSource': MSKEvent | SelfManagedKafkaEvent
  'Name': ConnectContactFlowEvent
  'Records.eventSource': CodeCommitTriggerEvent | DynamoDBStreamEvent | KinesisStreamEvent | S3Event | SESEvent | SQSEvent
  'Records.EventSource': SNSEvent
  'source': AmplifyGraphQlResolverEvent | CloudWatchAlarmEvent | CodePipelineCloudWatchEvent | EventBridgeEvent<any, any> | EventBridgeEvent<S3NotificationEvent['detail-type'], S3NotificationEvent['detail']>
  'triggerSource': CreateAuthChallengeTriggerEvent | CustomEmailSenderTriggerEvent | CustomMessageTriggerEvent | CustomSMSSenderTriggerEvent | DefineAuthChallengeTriggerEvent | PostAuthenticationTriggerEvent | PostConfirmationTriggerEvent | PreAuthenticationTriggerEvent | PreSignUpTriggerEvent | PreTokenGenerationV2TriggerEvent | PreTokenGenerationTriggerEvent | UserMigrationTriggerEvent | VerifyAuthChallengeResponseTriggerEvent
}
