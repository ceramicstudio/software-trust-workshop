// This is an auto-generated file, do not edit manually
export const definition = {
  models: {
    AccountTrustSignal: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6caryifb5k5zmyy59nzxjf24up6dxx0c6qejlw4u1xjyu7a6lt9r",
      accountRelation: { type: "set", fields: ["recipient"] },
    },
    AuditReview: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6cas3z6d6qag4w6uep3dsi599aqe5b6mciu8605aflc72hgl5d33",
      accountRelation: { type: "set", fields: ["auditId"] },
    },
    PeerTrustScore: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c5hli1m9cxa59lphtbro3rt4j9a7y438vzhbrjg7oapd1gjlatf",
      accountRelation: { type: "list" },
    },
    SecurityAudit: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6c6q90wpknf6vhrdo42ovs5tyjq5znnhcs99t1zy1ig3tiepgus2",
      accountRelation: { type: "set", fields: ["subjectId"] },
    },
    SoftwareTrustScore: {
      interface: false,
      implements: [],
      id: "kjzl6hvfrbw6cayicjs2wm2vssnp1cydtadxlb44rxyca9afmjjlvqhjblacwex",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    AccountTrustSignal: {
      recipient: {
        type: "did",
        required: true,
        immutable: true,
        indexed: true,
      },
      issuanceDate: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      trustWorthiness: {
        type: "list",
        required: true,
        immutable: false,
        item: {
          type: "reference",
          refType: "object",
          refName: "AccountTrustTypes",
          required: true,
          immutable: false,
        },
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    AccountTrustTypes: {
      level: { type: "float", required: true, immutable: false },
      scope: { type: "string", required: true, immutable: false },
      reason: {
        type: "list",
        required: false,
        immutable: false,
        item: { type: "string", required: false, immutable: false },
      },
    },
    AuditReview: {
      reason: {
        type: "list",
        required: true,
        immutable: false,
        item: { type: "string", required: true, immutable: false },
      },
      auditId: {
        type: "streamid",
        required: true,
        immutable: true,
        indexed: true,
      },
      issuanceDate: { type: "datetime", required: true, immutable: false },
      endorsedStatus: {
        type: "boolean",
        required: true,
        immutable: false,
        indexed: true,
      },
      audit: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "document",
          model:
            "kjzl6hvfrbw6c6q90wpknf6vhrdo42ovs5tyjq5znnhcs99t1zy1ig3tiepgus2",
          property: "auditId",
        },
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    Findings: {
      lang: { type: "string", required: true, immutable: false },
      type: { type: "string", required: true, immutable: false },
      criticality: { type: "float", required: true, immutable: false },
      description: { type: "string", required: false, immutable: false },
    },
    PeerTrustScore: {
      recipient: {
        type: "did",
        required: true,
        immutable: false,
        indexed: true,
      },
      trustScore: {
        type: "reference",
        refType: "object",
        refName: "TrustScore",
        required: true,
        immutable: false,
      },
      issuanceDate: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      trustScoreType: {
        type: "string",
        required: true,
        immutable: false,
        indexed: true,
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    SecurityAudit: {
      subjectId: {
        type: "string",
        required: true,
        immutable: true,
        indexed: true,
      },
      issuanceDate: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      securityStatus: {
        type: "boolean",
        required: true,
        immutable: false,
        indexed: true,
      },
      securityFindings: {
        type: "list",
        required: true,
        immutable: false,
        item: {
          type: "reference",
          refType: "object",
          refName: "Findings",
          required: true,
          immutable: false,
        },
      },
      issuer: { type: "view", viewType: "documentAccount" },
      reviews: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "queryConnection",
          model:
            "kjzl6hvfrbw6cas3z6d6qag4w6uep3dsi599aqe5b6mciu8605aflc72hgl5d33",
          property: "auditId",
        },
      },
    },
    SoftwareTrustScore: {
      subjectId: {
        type: "string",
        required: true,
        immutable: false,
        indexed: true,
      },
      trustScore: {
        type: "reference",
        refType: "object",
        refName: "TrustScore",
        required: true,
        immutable: false,
      },
      issuanceDate: {
        type: "datetime",
        required: true,
        immutable: false,
        indexed: true,
      },
      trustScoreType: {
        type: "string",
        required: true,
        immutable: false,
        indexed: true,
      },
      issuer: { type: "view", viewType: "documentAccount" },
    },
    TrustScore: {
      value: { type: "float", required: true, immutable: false },
      confidence: { type: "float", required: true, immutable: false },
    },
  },
  enums: {},
  accountData: {
    accountTrustSignal: { type: "set", name: "AccountTrustSignal" },
    accountTrustSignalList: { type: "connection", name: "AccountTrustSignal" },
    auditReview: { type: "set", name: "AuditReview" },
    auditReviewList: { type: "connection", name: "AuditReview" },
    peerTrustScoreList: { type: "connection", name: "PeerTrustScore" },
    recipientOfAccountTrustSignal: {
      type: "account-set",
      name: "AccountTrustSignal",
      property: "recipient",
    },
    recipientOfAccountTrustSignalList: {
      type: "account",
      name: "AccountTrustSignal",
      property: "recipient",
    },
    recipientOfPeerTrustScoreList: {
      type: "account",
      name: "PeerTrustScore",
      property: "recipient",
    },
    securityAudit: { type: "set", name: "SecurityAudit" },
    securityAuditList: { type: "connection", name: "SecurityAudit" },
    softwareTrustScoreList: { type: "connection", name: "SoftwareTrustScore" },
  },
};
