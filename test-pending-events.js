import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPendingEvents() {
  try {
    console.log('Checking for events with PENDING_REVIEW status...');
    
    const pendingEvents = await prisma.event.findMany({
      where: {
        status: 'PENDING_REVIEW'
      },
      include: {
        organizer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${pendingEvents.length} events with PENDING_REVIEW status:`);
    
    if (pendingEvents.length > 0) {
      pendingEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. Event: ${event.title}`);
        console.log(`   ID: ${event.id}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   Organizer: ${event.organizer.orgName} (${event.organizer.user.email})`);
        console.log(`   Created: ${event.createdAt}`);
      });
    } else {
      console.log('No events found with PENDING_REVIEW status.');
      
      // Let's also check for DRAFT events
      const draftEvents = await prisma.event.findMany({
        where: {
          status: 'DRAFT'
        },
        include: {
          organizer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });
      
      console.log(`\nFound ${draftEvents.length} events with DRAFT status:`);
      
      if (draftEvents.length > 0) {
        draftEvents.forEach((event, index) => {
          console.log(`\n${index + 1}. Event: ${event.title}`);
          console.log(`   ID: ${event.id}`);
          console.log(`   Status: ${event.status}`);
          console.log(`   Organizer: ${event.organizer.orgName} (${event.organizer.user.email})`);
          console.log(`   Created: ${event.createdAt}`);
        });
      }
    }
    
    // Let's also check all event statuses
    const allEvents = await prisma.event.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\nEvent status summary:');
    allEvents.forEach(group => {
      console.log(`  ${group.status}: ${group._count.status} events`);
    });
    
  } catch (error) {
    console.error('Error checking pending events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPendingEvents();
