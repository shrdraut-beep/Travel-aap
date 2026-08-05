import re

content = open("src/utils/touristSpotImages.ts", "r").read()
content = content.replace(
'''export const getBrochureHeroContent = (
  destinationName: string = '',
  tripTitle: string = ''
) => {''',
'''export const getBrochureHeroContent = (
  destinationName: string = '',
  tripTitle: string = '',
  itineraryText: string = ''
) => {'''
)
open("src/utils/touristSpotImages.ts", "w").write(content)
