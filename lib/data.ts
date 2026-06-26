import { Subject } from "./types"

const mkResources = () => ([
  { type: "video" as const, done: false },
  { type: "notes" as const, done: false },
  { type: "pyq" as const, done: false },
  { type: "revise" as const, done: false },
])

export const seedSubjects: Subject[] = [
  {
    id: "phy",
    name: "Physics",
    color: "#7c3aed",
    icon: "⚛️",
    xp: 1120,
    level: 4,
    chapters: [
      { id:"phy-1", name:"Kinematics", difficulty:"⭐", confidence:2, isBoss:false, resources: mkResources() },
      { id:"phy-2", name:"Laws of Motion", difficulty:"⭐⭐", confidence:1, isBoss:false, resources: mkResources() },
      { id:"phy-3", name:"Rotational Motion", difficulty:"⭐⭐⭐", confidence:0, isBoss:true, resources: mkResources() },
      { id:"phy-4", name:"Thermodynamics", difficulty:"⭐⭐", confidence:1, isBoss:false, resources: mkResources() },
      { id:"phy-5", name:"Electromagnetism", difficulty:"⭐⭐⭐", confidence:0, isBoss:true, resources: mkResources() },
    ]
  },
  {
    id: "chem",
    name: "Chemistry",
    color: "#06b6d4",
    icon: "🧪",
    xp: 890,
    level: 3,
    chapters: [
      { id:"chem-1", name:"Mole Concept", difficulty:"⭐", confidence:2, isBoss:false, resources: mkResources() },
      { id:"chem-2", name:"Chemical Bonding", difficulty:"⭐⭐", confidence:1, isBoss:false, resources: mkResources() },
      { id:"chem-3", name:"Organic Basics", difficulty:"⭐⭐⭐", confidence:0, isBoss:true, resources: mkResources() },
    ]
  },
  {
    id: "math",
    name: "Mathematics",
    color: "#f59e0b",
    icon: "📐",
    xp: 1560,
    level: 6,
    chapters: [
      { id:"math-1", name:"Calculus", difficulty:"⭐⭐⭐", confidence:1, isBoss:true, resources: mkResources() },
      { id:"math-2", name:"Trigonometry", difficulty:"⭐", confidence:2, isBoss:false, resources: mkResources() },
      { id:"math-3", name:"Probability", difficulty:"⭐⭐", confidence:1, isBoss:false, resources: mkResources() },
    ]
  },
  {
    id: "bio",
    name: "Biology",
    color: "#10b981",
    icon: "🧬",
    xp: 420,
    level: 2,
    chapters: [
      { id:"bio-1", name:"Cell Structure", difficulty:"⭐", confidence:1, isBoss:false, resources: mkResources() },
      { id:"bio-2", name:"Genetics", difficulty:"⭐⭐⭐", confidence:0, isBoss:true, resources: mkResources() },
    ]
  },
]
