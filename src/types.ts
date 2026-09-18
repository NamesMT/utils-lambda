import type {
  ALBEvent,
  AmplifyGraphQlResolverEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
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
  SelfManagedKafkaEvent,
  SESEvent,
  SNSEvent,
  SQSEvent,
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
export type LambdaRequestEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | ALBEvent | LatticeProxyEventV2

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

/**
 * Amazon VPC Lattice v2 event.
 * Not yet available in `@types/aws-lambda`, so defined locally.
 */
export interface LatticeRequestContextV2 {
  serviceNetworkArn: string
  serviceArn: string
  targetGroupArn: string
  region: string
  timeEpoch: string
  identity: {
    sourceVpcArn?: string
    type?: string
    principal?: string
    principalOrgID?: string
    sessionName?: string
    x509IssuerOu?: string
    x509SanDns?: string
    x509SanNameCn?: string
    x509SanUri?: string
    x509SubjectCn?: string
  }
}

export interface LatticeProxyEventV2 {
  version: string
  path: string
  method: string
  headers: Record<string, string[] | undefined>
  queryStringParameters: Record<string, string[] | undefined>
  body: string | null
  isBase64Encoded: boolean
  requestContext: LatticeRequestContextV2
}
