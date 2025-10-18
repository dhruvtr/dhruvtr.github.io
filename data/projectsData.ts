interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Diverse Code Generation with Large Language Models',
    description: `Utilized Quality Diversity and Reinforcement
Learning based optimization techniques for more diverse semantic and syntactic code sampling using LLMs, leading to
10% improvement in generated code accuracy over baselines`,
    href: 'https://github.com/LLM-QD/LLM-QD',
  },
  {
    title: 'Ray Tracer',
    description: `Wrote a custom multi-threaded ray-tracer from scratch in C++ that handles recursive and spectral
reflection and soft shadows. Enhanced anti-aliasing through gaussian super-sampling.`,
    href: 'https://github.com/dhruvtr/Ray-Tracer',
  },
  {
    title: 'Majuli River Island Virtual Reality Tour',
    description: `Developed a 3D Interactive Virtual Reality Tour of Majuli River Island
in Unity leveraging over 500 360-degree images and 20 360-degree videos and deployed on Meta Quest 2.`,
    href: 'https://github.com/dhruvtr/Majuli-Virtual-Tour',
  },
  {
    title: 'xv6: Unix-based Operating System',
    description: `Implemented a Shortest-job-first and Round-robin based hybrid CPU
scheduling algorithm, paging, lazy memory allocation and dynamic page swapping using C language.`,
    href: 'https://github.com/HarshBhakkad/xv6',
  },
]

export default projectsData
